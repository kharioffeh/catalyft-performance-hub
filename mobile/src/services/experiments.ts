import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsService from './analytics';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: ExperimentVariant[];
  targetAudience?: TargetAudience;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // Percentage of users (0-100)
  config: Record<string, any>;
}

export interface TargetAudience {
  minVersion?: string;
  maxVersion?: string;
  platforms?: ('ios' | 'android')[];
  userProperties?: Record<string, any>;
  percentage?: number; // Percentage of eligible users to include
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
}

// Feature flags
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: any;
  rolloutPercentage?: number;
}

// Predefined experiments
export const EXPERIMENTS = {
  ONBOARDING_FLOW: 'onboarding_flow',
  NOTIFICATION_TIMING: 'notification_timing',
  UI_LAYOUT: 'ui_layout',
  PRICING_PAGE: 'pricing_page',
  SOCIAL_FEATURES: 'social_features',
  WORKOUT_RECOMMENDATIONS: 'workout_recommendations',
  GAMIFICATION: 'gamification',
};

// Feature flag keys
export const FEATURE_FLAGS = {
  NEW_ONBOARDING: 'new_onboarding',
  SOCIAL_FEED: 'social_feed',
  AI_COACH: 'ai_coach',
  VOICE_COMMANDS: 'voice_commands',
  DARK_MODE: 'dark_mode',
  OFFLINE_MODE: 'offline_mode',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  VIDEO_TUTORIALS: 'video_tutorials',
  COMMUNITY_CHALLENGES: 'community_challenges',
  NUTRITION_TRACKING: 'nutrition_tracking',
};

class ExperimentsService {
  private static instance: ExperimentsService;
  private assignments: Map<string, ExperimentAssignment> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private userId: string | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): ExperimentsService {
    if (!ExperimentsService.instance) {
      ExperimentsService.instance = new ExperimentsService();
    }
    return ExperimentsService.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.initialized) {
      console.warn('Experiments already initialized');
      return;
    }

    this.userId = userId;
    
    // Load cached assignments
    await this.loadAssignments();
    
    // Load feature flags
    await this.loadFeatureFlags();
    
    // Fetch latest experiments from backend
    await this.fetchExperiments();
    
    this.initialized = true;
    console.log('Experiments service initialized');
  }

  private async loadAssignments(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('experiment_assignments');
      if (stored) {
        const assignments = JSON.parse(stored) as ExperimentAssignment[];
        assignments.forEach(assignment => {
          this.assignments.set(assignment.experimentId, assignment);
        });
      }
    } catch (error) {
      console.error('Failed to load experiment assignments:', error);
    }
  }

  private async saveAssignments(): Promise<void> {
    try {
      const assignments = Array.from(this.assignments.values());
      await AsyncStorage.setItem('experiment_assignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Failed to save experiment assignments:', error);
    }
  }

  private async loadFeatureFlags(): Promise<void> {
    // Default feature flags
    const defaultFlags: FeatureFlag[] = [
      { key: FEATURE_FLAGS.NEW_ONBOARDING, enabled: true, rolloutPercentage: 100 },
      { key: FEATURE_FLAGS.SOCIAL_FEED, enabled: true, rolloutPercentage: 80 },
      { key: FEATURE_FLAGS.AI_COACH, enabled: false, rolloutPercentage: 20 },
      { key: FEATURE_FLAGS.VOICE_COMMANDS, enabled: false, rolloutPercentage: 10 },
      { key: FEATURE_FLAGS.DARK_MODE, enabled: true, rolloutPercentage: 100 },
      { key: FEATURE_FLAGS.OFFLINE_MODE, enabled: true, rolloutPercentage: 100 },
      { key: FEATURE_FLAGS.ADVANCED_ANALYTICS, enabled: true, rolloutPercentage: 50 },
      { key: FEATURE_FLAGS.VIDEO_TUTORIALS, enabled: true, rolloutPercentage: 100 },
      { key: FEATURE_FLAGS.COMMUNITY_CHALLENGES, enabled: true, rolloutPercentage: 70 },
      { key: FEATURE_FLAGS.NUTRITION_TRACKING, enabled: true, rolloutPercentage: 60 },
    ];

    // Load from storage or use defaults
    try {
      const stored = await AsyncStorage.getItem('feature_flags');
      const flags = stored ? JSON.parse(stored) : defaultFlags;
      
      flags.forEach((flag: FeatureFlag) => {
        this.featureFlags.set(flag.key, flag);
      });
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      defaultFlags.forEach(flag => {
        this.featureFlags.set(flag.key, flag);
      });
    }
  }

  private async fetchExperiments(): Promise<void> {
    // TODO: Fetch from backend API
    // For now, using mock data
    const mockExperiments: Experiment[] = [
      {
        id: EXPERIMENTS.ONBOARDING_FLOW,
        name: 'Onboarding Flow Test',
        description: 'Testing different onboarding flows',
        status: 'running',
        startDate: '2024-01-01',
        variants: [
          {
            id: 'control',
            name: 'Control',
            weight: 50,
            config: { steps: 6, showTutorial: true },
          },
          {
            id: 'simplified',
            name: 'Simplified',
            weight: 50,
            config: { steps: 3, showTutorial: false },
          },
        ],
      },
      {
        id: EXPERIMENTS.NOTIFICATION_TIMING,
        name: 'Notification Timing',
        description: 'Testing optimal notification times',
        status: 'running',
        startDate: '2024-01-01',
        variants: [
          {
            id: 'morning',
            name: 'Morning',
            weight: 33,
            config: { time: '08:00', frequency: 'daily' },
          },
          {
            id: 'evening',
            name: 'Evening',
            weight: 33,
            config: { time: '18:00', frequency: 'daily' },
          },
          {
            id: 'adaptive',
            name: 'Adaptive',
            weight: 34,
            config: { time: 'adaptive', frequency: 'smart' },
          },
        ],
      },
    ];

    // Assign users to experiments if not already assigned
    for (const experiment of mockExperiments) {
      if (experiment.status === 'running' && !this.assignments.has(experiment.id)) {
        await this.assignToExperiment(experiment);
      }
    }
  }

  private async assignToExperiment(experiment: Experiment): Promise<void> {
    if (!this.userId) return;

    // Check if user is in target audience
    if (experiment.targetAudience) {
      // TODO: Implement audience targeting logic
    }

    // Random assignment based on weights
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        const assignment: ExperimentAssignment = {
          experimentId: experiment.id,
          variantId: variant.id,
          assignedAt: new Date().toISOString(),
        };
        
        this.assignments.set(experiment.id, assignment);
        await this.saveAssignments();
        
        // Track assignment
        AnalyticsService.track('experiment_assigned', {
          experiment_id: experiment.id,
          variant_id: variant.id,
          variant_name: variant.name,
        });
        
        break;
      }
    }
  }

  getVariant(experimentId: string): string | null {
    const assignment = this.assignments.get(experimentId);
    return assignment ? assignment.variantId : null;
  }

  getVariantConfig(experimentId: string): Record<string, any> | null {
    const assignment = this.assignments.get(experimentId);
    if (!assignment) return null;

    // TODO: Get config from experiment definition
    // For now, return mock config
    const configs: Record<string, Record<string, any>> = {
      [EXPERIMENTS.ONBOARDING_FLOW]: {
        control: { steps: 6, showTutorial: true },
        simplified: { steps: 3, showTutorial: false },
      },
      [EXPERIMENTS.NOTIFICATION_TIMING]: {
        morning: { time: '08:00', frequency: 'daily' },
        evening: { time: '18:00', frequency: 'daily' },
        adaptive: { time: 'adaptive', frequency: 'smart' },
      },
    };

    return configs[experimentId]?.[assignment.variantId] || null;
  }

  isFeatureEnabled(flagKey: string): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (!flag) return false;
    
    if (!flag.enabled) return false;
    
    // Check rollout percentage
    if (flag.rolloutPercentage && flag.rolloutPercentage < 100) {
      const hash = this.hashUserId(this.userId || 'anonymous', flagKey);
      return hash <= flag.rolloutPercentage;
    }
    
    return true;
  }

  getFeatureFlagValue(flagKey: string): any {
    const flag = this.featureFlags.get(flagKey);
    return flag?.value;
  }

  private hashUserId(userId: string, salt: string): number {
    // Simple hash function for consistent assignment
    let hash = 0;
    const str = `${userId}:${salt}`;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash) % 100;
  }

  trackExperimentEvent(eventName: string, properties?: Record<string, any>): void {
    const enrichedProperties = { ...properties };
    
    // Add experiment context to all events
    this.assignments.forEach((assignment, experimentId) => {
      enrichedProperties[`experiment_${experimentId}`] = assignment.variantId;
    });
    
    // Add feature flag context
    this.featureFlags.forEach((flag, key) => {
      if (this.isFeatureEnabled(key)) {
        enrichedProperties[`feature_${key}`] = true;
      }
    });
    
    AnalyticsService.track(eventName, enrichedProperties);
  }

  // Test helpers for development
  overrideVariant(experimentId: string, variantId: string): void {
    if (__DEV__) {
      const assignment: ExperimentAssignment = {
        experimentId,
        variantId,
        assignedAt: new Date().toISOString(),
      };
      this.assignments.set(experimentId, assignment);
      console.log(`Overrode experiment ${experimentId} to variant ${variantId}`);
    }
  }

  overrideFeatureFlag(flagKey: string, enabled: boolean, value?: any): void {
    if (__DEV__) {
      const flag = this.featureFlags.get(flagKey) || { key: flagKey, enabled: false };
      flag.enabled = enabled;
      if (value !== undefined) {
        flag.value = value;
      }
      this.featureFlags.set(flagKey, flag);
      console.log(`Overrode feature flag ${flagKey} to ${enabled}`);
    }
  }

  reset(): void {
    this.assignments.clear();
    this.featureFlags.clear();
    this.userId = null;
    this.initialized = false;
    AsyncStorage.removeItem('experiment_assignments');
  }
}

export default ExperimentsService.getInstance();