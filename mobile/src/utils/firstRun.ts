import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsService from '../services/analytics';
import ExperimentsService from '../services/experiments';

const FIRST_RUN_KEY = 'app_first_run';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const USER_VERSION_KEY = 'user_app_version';
const INSTALL_DATE_KEY = 'app_install_date';

export interface FirstRunData {
  isFirstRun: boolean;
  hasCompletedOnboarding: boolean;
  installDate: string | null;
  previousVersion: string | null;
  currentVersion: string;
  daysSinceInstall: number;
}

class FirstRunManager {
  private static instance: FirstRunManager;
  private currentVersion = '1.0.0'; // TODO: Get from app config

  private constructor() {}

  static getInstance(): FirstRunManager {
    if (!FirstRunManager.instance) {
      FirstRunManager.instance = new FirstRunManager();
    }
    return FirstRunManager.instance;
  }

  async checkFirstRun(): Promise<FirstRunData> {
    try {
      const [isFirstRun, hasCompletedOnboarding, installDate, previousVersion] = await Promise.all([
        this.getIsFirstRun(),
        this.getHasCompletedOnboarding(),
        this.getInstallDate(),
        this.getPreviousVersion(),
      ]);

      const daysSinceInstall = this.calculateDaysSinceInstall(installDate);

      const data: FirstRunData = {
        isFirstRun,
        hasCompletedOnboarding,
        installDate,
        previousVersion,
        currentVersion: this.currentVersion,
        daysSinceInstall,
      };

      // Track first run analytics
      if (isFirstRun) {
        await this.handleFirstRun();
      } else if (previousVersion && previousVersion !== this.currentVersion) {
        await this.handleAppUpdate(previousVersion);
      }

      return data;
    } catch (error) {
      console.error('Error checking first run:', error);
      return {
        isFirstRun: false,
        hasCompletedOnboarding: true,
        installDate: null,
        previousVersion: null,
        currentVersion: this.currentVersion,
        daysSinceInstall: 0,
      };
    }
  }

  private async getIsFirstRun(): Promise<boolean> {
    const firstRun = await AsyncStorage.getItem(FIRST_RUN_KEY);
    return firstRun === null;
  }

  private async getHasCompletedOnboarding(): Promise<boolean> {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  }

  private async getInstallDate(): Promise<string | null> {
    return await AsyncStorage.getItem(INSTALL_DATE_KEY);
  }

  private async getPreviousVersion(): Promise<string | null> {
    return await AsyncStorage.getItem(USER_VERSION_KEY);
  }

  private calculateDaysSinceInstall(installDate: string | null): number {
    if (!installDate) return 0;
    
    const install = new Date(installDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - install.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  private async handleFirstRun(): Promise<void> {
    const now = new Date().toISOString();
    
    // Set first run flag
    await AsyncStorage.setItem(FIRST_RUN_KEY, 'false');
    await AsyncStorage.setItem(INSTALL_DATE_KEY, now);
    await AsyncStorage.setItem(USER_VERSION_KEY, this.currentVersion);

    // Track install event
    AnalyticsService.track('app_installed', {
      version: this.currentVersion,
      install_date: now,
    });

    // Initialize experiments for new user
    // User ID will be set after auth
    console.log('First run detected - app installed');
  }

  private async handleAppUpdate(previousVersion: string): Promise<void> {
    // Update stored version
    await AsyncStorage.setItem(USER_VERSION_KEY, this.currentVersion);

    // Track update event
    AnalyticsService.track('app_updated', {
      previous_version: previousVersion,
      current_version: this.currentVersion,
    });

    console.log(`App updated from ${previousVersion} to ${this.currentVersion}`);

    // Handle migration if needed
    await this.migrateData(previousVersion);
  }

  private async migrateData(fromVersion: string): Promise<void> {
    // Version-specific migrations
    const migrations: Record<string, () => Promise<void>> = {
      '0.9.0': async () => {
        // Migrate from 0.9.0 to 1.0.0
        console.log('Migrating from 0.9.0...');
        // Add migration logic here
      },
      // Add more migrations as needed
    };

    // Run applicable migrations
    for (const [version, migration] of Object.entries(migrations)) {
      if (this.compareVersions(fromVersion, version) <= 0) {
        await migration();
      }
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  async markOnboardingCompleted(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    
    AnalyticsService.track('onboarding_completed', {
      version: this.currentVersion,
    });
  }

  async resetOnboarding(): Promise<void> {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  }

  async shouldShowOnboarding(): Promise<boolean> {
    const [isFirstRun, hasCompletedOnboarding] = await Promise.all([
      this.getIsFirstRun(),
      this.getHasCompletedOnboarding(),
    ]);

    // Show onboarding if:
    // 1. It's the first run
    // 2. User hasn't completed onboarding
    // 3. Feature flag is enabled for new onboarding experience
    const showNewOnboarding = ExperimentsService.isFeatureEnabled('new_onboarding');

    return (isFirstRun || !hasCompletedOnboarding) && showNewOnboarding;
  }

  async shouldShowRatingPrompt(): Promise<boolean> {
    const hasRated = await AsyncStorage.getItem('hasRatedApp');
    const neverAsk = await AsyncStorage.getItem('neverAskForRating');
    const lastPrompt = await AsyncStorage.getItem('lastRatingPrompt');
    const installDate = await this.getInstallDate();

    if (hasRated === 'true' || neverAsk === 'true') {
      return false;
    }

    // Check days since install (wait at least 7 days)
    const daysSinceInstall = this.calculateDaysSinceInstall(installDate);
    if (daysSinceInstall < 7) {
      return false;
    }

    // Check time since last prompt (wait at least 30 days)
    if (lastPrompt) {
      const daysSinceLastPrompt = this.calculateDaysSinceInstall(lastPrompt);
      if (daysSinceLastPrompt < 30) {
        return false;
      }
    }

    // Check user engagement (example criteria)
    // TODO: Add more sophisticated engagement checks
    
    return true;
  }

  async shouldShowSurvey(surveyType: 'nps' | 'feature'): Promise<boolean> {
    const surveyKey = `survey_${surveyType}_completed`;
    const lastSurvey = await AsyncStorage.getItem(surveyKey);
    
    if (!lastSurvey) {
      return true;
    }

    // Check time since last survey (wait at least 60 days for NPS, 30 for feature)
    const daysSinceLastSurvey = this.calculateDaysSinceInstall(lastSurvey);
    const waitDays = surveyType === 'nps' ? 60 : 30;
    
    return daysSinceLastSurvey >= waitDays;
  }

  async markSurveyCompleted(surveyType: 'nps' | 'feature'): Promise<void> {
    const surveyKey = `survey_${surveyType}_completed`;
    await AsyncStorage.setItem(surveyKey, new Date().toISOString());
  }

  async clearAllData(): Promise<void> {
    // Clear all first run related data (useful for testing)
    await AsyncStorage.multiRemove([
      FIRST_RUN_KEY,
      ONBOARDING_COMPLETED_KEY,
      USER_VERSION_KEY,
      INSTALL_DATE_KEY,
      'hasRatedApp',
      'neverAskForRating',
      'lastRatingPrompt',
      'survey_nps_completed',
      'survey_feature_completed',
    ]);
  }
}

export default FirstRunManager.getInstance();