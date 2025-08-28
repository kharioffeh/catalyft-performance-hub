import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import EnhancedAnalyticsService from './analytics.enhanced';
import crashlytics from '@react-native-firebase/crashlytics';

export enum ConsentType {
  ANALYTICS = 'analytics',
  CRASH_REPORTS = 'crash_reports',
  PERSONALIZATION = 'personalization',
  MARKETING = 'marketing',
  THIRD_PARTY_SHARING = 'third_party_sharing',
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
}

export interface ConsentRecord {
  type: ConsentType;
  status: ConsentStatus;
  timestamp: number;
  version: string;
  ipAddress?: string;
  method: 'explicit' | 'implicit' | 'opt_out';
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  personalizationEnabled: boolean;
  marketingEnabled: boolean;
  thirdPartySharingEnabled: boolean;
  dataRetentionDays: number;
}

export interface UserPrivacyProfile {
  userId: string;
  consents: ConsentRecord[];
  settings: PrivacySettings;
  gdprApplies: boolean;
  ccpaApplies: boolean;
  ageVerified: boolean;
  parentalConsent?: boolean;
  lastUpdated: number;
}

class PrivacyConsentService {
  private static instance: PrivacyConsentService;
  private userProfile: UserPrivacyProfile | null = null;
  private privacyPolicyVersion = '1.0.0';
  private minimumAge = 13; // COPPA compliance
  
  private constructor() {}
  
  static getInstance(): PrivacyConsentService {
    if (!PrivacyConsentService.instance) {
      PrivacyConsentService.instance = new PrivacyConsentService();
    }
    return PrivacyConsentService.instance;
  }
  
  async initialize(userId: string): Promise<void> {
    // Load existing privacy profile
    await this.loadUserProfile(userId);
    
    // Determine jurisdiction
    const gdprApplies = await this.checkGDPR();
    const ccpaApplies = await this.checkCCPA();
    
    if (!this.userProfile) {
      // Create new profile
      this.userProfile = {
        userId,
        consents: [],
        settings: this.getDefaultSettings(gdprApplies, ccpaApplies),
        gdprApplies,
        ccpaApplies,
        ageVerified: false,
        lastUpdated: Date.now(),
      };
      
      await this.saveUserProfile();
    }
    
    // Apply privacy settings
    await this.applyPrivacySettings();
  }
  
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`privacy_profile_${userId}`);
      if (stored) {
        this.userProfile = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load privacy profile:', error);
    }
  }
  
  private async saveUserProfile(): Promise<void> {
    if (!this.userProfile) return;
    
    try {
      await AsyncStorage.setItem(
        `privacy_profile_${this.userProfile.userId}`,
        JSON.stringify(this.userProfile)
      );
    } catch (error) {
      console.error('Failed to save privacy profile:', error);
    }
  }
  
  private getDefaultSettings(gdprApplies: boolean, ccpaApplies: boolean): PrivacySettings {
    // Default settings based on jurisdiction
    if (gdprApplies) {
      // GDPR - opt-in required
      return {
        analyticsEnabled: false,
        crashReportingEnabled: false,
        personalizationEnabled: false,
        marketingEnabled: false,
        thirdPartySharingEnabled: false,
        dataRetentionDays: 90,
      };
    } else if (ccpaApplies) {
      // CCPA - opt-out model
      return {
        analyticsEnabled: true,
        crashReportingEnabled: true,
        personalizationEnabled: true,
        marketingEnabled: false,
        thirdPartySharingEnabled: false,
        dataRetentionDays: 365,
      };
    } else {
      // Rest of world
      return {
        analyticsEnabled: true,
        crashReportingEnabled: true,
        personalizationEnabled: true,
        marketingEnabled: true,
        thirdPartySharingEnabled: false,
        dataRetentionDays: 730,
      };
    }
  }
  
  private async checkGDPR(): Promise<boolean> {
    // Check if user is in EU
    try {
      // TODO: Implement IP geolocation check
      // For now, check device locale
      const locale = Platform.OS === 'ios' 
        ? require('react-native').NativeModules.SettingsManager?.settings?.AppleLocale
        : require('react-native').NativeModules.I18nManager?.localeIdentifier;
      
      const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE', 'DK', 'FI'];
      const countryCode = locale?.split('_')[1] || locale?.split('-')[1];
      
      return euCountries.includes(countryCode);
    } catch (error) {
      console.error('Failed to check GDPR:', error);
      return false; // Default to non-GDPR
    }
  }
  
  private async checkCCPA(): Promise<boolean> {
    // Check if user is in California
    try {
      // TODO: Implement IP geolocation check
      // For now, check timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone?.includes('Los_Angeles') || false;
    } catch (error) {
      console.error('Failed to check CCPA:', error);
      return false;
    }
  }
  
  // Record consent
  async recordConsent(
    type: ConsentType,
    status: ConsentStatus,
    method: 'explicit' | 'implicit' | 'opt_out' = 'explicit'
  ): Promise<void> {
    if (!this.userProfile) return;
    
    const consent: ConsentRecord = {
      type,
      status,
      timestamp: Date.now(),
      version: this.privacyPolicyVersion,
      method,
    };
    
    // Remove any existing consent for this type
    this.userProfile.consents = this.userProfile.consents.filter(c => c.type !== type);
    
    // Add new consent
    this.userProfile.consents.push(consent);
    
    // Update settings
    this.updateSettingsFromConsent(type, status);
    
    // Save profile
    await this.saveUserProfile();
    
    // Apply settings
    await this.applyPrivacySettings();
    
    // Track consent event
    if (this.userProfile.settings.analyticsEnabled) {
      EnhancedAnalyticsService.track('privacy_consent_updated', {
        consent_type: type,
        consent_status: status,
        consent_method: method,
        gdpr_applies: this.userProfile.gdprApplies,
        ccpa_applies: this.userProfile.ccpaApplies,
      });
    }
  }
  
  private updateSettingsFromConsent(type: ConsentType, status: ConsentStatus): void {
    if (!this.userProfile) return;
    
    const enabled = status === ConsentStatus.GRANTED;
    
    switch (type) {
      case ConsentType.ANALYTICS:
        this.userProfile.settings.analyticsEnabled = enabled;
        break;
      case ConsentType.CRASH_REPORTS:
        this.userProfile.settings.crashReportingEnabled = enabled;
        break;
      case ConsentType.PERSONALIZATION:
        this.userProfile.settings.personalizationEnabled = enabled;
        break;
      case ConsentType.MARKETING:
        this.userProfile.settings.marketingEnabled = enabled;
        break;
      case ConsentType.THIRD_PARTY_SHARING:
        this.userProfile.settings.thirdPartySharingEnabled = enabled;
        break;
    }
  }
  
  // Apply privacy settings to services
  private async applyPrivacySettings(): Promise<void> {
    if (!this.userProfile) return;
    
    const { settings } = this.userProfile;
    
    // Configure analytics
    if (!settings.analyticsEnabled) {
      // Disable analytics
      EnhancedAnalyticsService.reset();
      console.log('Analytics disabled per user privacy settings');
    }
    
    // Configure crash reporting
    await crashlytics().setCrashlyticsCollectionEnabled(settings.crashReportingEnabled);
    
    // Store settings for other services to check
    await AsyncStorage.setItem('privacy_settings', JSON.stringify(settings));
  }
  
  // Check if consent is required
  isConsentRequired(type: ConsentType): boolean {
    if (!this.userProfile) return false;
    
    // GDPR requires explicit consent
    if (this.userProfile.gdprApplies) {
      return true;
    }
    
    // CCPA requires opt-out option for selling data
    if (this.userProfile.ccpaApplies && type === ConsentType.THIRD_PARTY_SHARING) {
      return true;
    }
    
    return false;
  }
  
  // Get consent status
  getConsentStatus(type: ConsentType): ConsentStatus {
    if (!this.userProfile) return ConsentStatus.PENDING;
    
    const consent = this.userProfile.consents.find(c => c.type === type);
    return consent?.status || ConsentStatus.PENDING;
  }
  
  // Check if analytics is allowed
  isAnalyticsAllowed(): boolean {
    return this.userProfile?.settings.analyticsEnabled || false;
  }
  
  // Check if personalization is allowed
  isPersonalizationAllowed(): boolean {
    return this.userProfile?.settings.personalizationEnabled || false;
  }
  
  // Check if marketing is allowed
  isMarketingAllowed(): boolean {
    return this.userProfile?.settings.marketingEnabled || false;
  }
  
  // Age verification
  async verifyAge(birthDate: Date): Promise<boolean> {
    if (!this.userProfile) return false;
    
    const age = this.calculateAge(birthDate);
    this.userProfile.ageVerified = true;
    
    if (age < this.minimumAge) {
      // Under 13 - COPPA applies
      this.userProfile.parentalConsent = false;
      
      // Disable all data collection
      this.userProfile.settings = {
        analyticsEnabled: false,
        crashReportingEnabled: false,
        personalizationEnabled: false,
        marketingEnabled: false,
        thirdPartySharingEnabled: false,
        dataRetentionDays: 0,
      };
      
      await this.saveUserProfile();
      await this.applyPrivacySettings();
      
      return false;
    }
    
    await this.saveUserProfile();
    return true;
  }
  
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // Data deletion request (GDPR Article 17 - Right to be forgotten)
  async requestDataDeletion(): Promise<void> {
    if (!this.userProfile) return;
    
    // Track deletion request
    if (this.userProfile.settings.analyticsEnabled) {
      EnhancedAnalyticsService.track('data_deletion_requested', {
        user_id: this.userProfile.userId,
        gdpr_applies: this.userProfile.gdprApplies,
        ccpa_applies: this.userProfile.ccpaApplies,
      });
    }
    
    // TODO: Send deletion request to backend
    
    // Clear local data
    await this.clearAllUserData();
  }
  
  // Data export request (GDPR Article 20 - Right to data portability)
  async requestDataExport(): Promise<void> {
    if (!this.userProfile) return;
    
    // Track export request
    if (this.userProfile.settings.analyticsEnabled) {
      EnhancedAnalyticsService.track('data_export_requested', {
        user_id: this.userProfile.userId,
        gdpr_applies: this.userProfile.gdprApplies,
      });
    }
    
    // TODO: Send export request to backend
  }
  
  // Clear all user data
  private async clearAllUserData(): Promise<void> {
    if (!this.userProfile) return;
    
    const userId = this.userProfile.userId;
    
    // Clear analytics
    EnhancedAnalyticsService.reset();
    
    // Clear stored data
    const keysToRemove = [
      `privacy_profile_${userId}`,
      `user_profile_${userId}`,
      `analytics_user_id`,
      'onboarding_state',
      'ab_assignments',
      'experiment_assignments',
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    // Reset profile
    this.userProfile = null;
  }
  
  // Get privacy policy URL
  getPrivacyPolicyUrl(): string {
    return 'https://catalyft.com/privacy';
  }
  
  // Get terms of service URL
  getTermsOfServiceUrl(): string {
    return 'https://catalyft.com/terms';
  }
  
  // Check if user needs to re-consent (policy updated)
  async checkReconsentRequired(): Promise<boolean> {
    if (!this.userProfile) return false;
    
    const lastConsentVersion = this.userProfile.consents[0]?.version;
    return lastConsentVersion !== this.privacyPolicyVersion;
  }
  
  // Export user privacy profile
  exportPrivacyProfile(): UserPrivacyProfile | null {
    return this.userProfile;
  }
}

export default PrivacyConsentService.getInstance();