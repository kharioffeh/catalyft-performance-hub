import { FEATURE_FLAGS, SUBSCRIPTION_PLANS } from '../../constants/subscriptions';
import { FeatureKey, Subscription } from '../../types/payments';
import StripePaymentService from './stripe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

interface FeatureAccess {
  hasAccess: boolean;
  requiredTier?: 'Premium' | 'Elite';
  reason?: string;
}

interface CachedFeatureAccess {
  [key: string]: {
    hasAccess: boolean;
    timestamp: number;
  };
}

class FeatureGateService {
  private static instance: FeatureGateService;
  private cache: Map<string, FeatureAccess> = new Map();
  private subscription: Subscription | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastFetchTime = 0;

  private featureMatrix: Record<string, ('Free' | 'Premium' | 'Elite')[]> = {
    [FEATURE_FLAGS.UNLIMITED_WORKOUTS]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.FULL_EXERCISE_LIBRARY]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.BARCODE_SCANNING]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.ADVANCED_ANALYTICS]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.AI_COACH_UNLIMITED]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.WEARABLE_SYNC]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.CUSTOM_WORKOUT_PLANS]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.MEAL_PLANNING]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.FORM_ANALYSIS]: ['Elite'],
    [FEATURE_FLAGS.PERSONALIZED_PROGRAMMING]: ['Elite'],
    [FEATURE_FLAGS.COACH_CHECK_INS]: ['Elite'],
    [FEATURE_FLAGS.SUPPLEMENT_GUIDANCE]: ['Elite'],
    [FEATURE_FLAGS.GROUP_CHALLENGES]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.EXPORT_DATA]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.PRIORITY_SUPPORT]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.PROGRESS_PHOTOS]: ['Premium', 'Elite'],
    [FEATURE_FLAGS.RECOVERY_PROGRAMS]: ['Elite'],
    [FEATURE_FLAGS.COMPETITION_PREP]: ['Elite'],
  };

  private constructor() {}

  static getInstance(): FeatureGateService {
    if (!FeatureGateService.instance) {
      FeatureGateService.instance = new FeatureGateService();
    }
    return FeatureGateService.instance;
  }

  // Initialize with user subscription
  async initialize(): Promise<void> {
    try {
      // Load cached feature access
      await this.loadCachedFeatures();
      
      // Get current subscription
      this.subscription = await StripePaymentService.getSubscriptionStatus();
      
      // Set up real-time subscription listener
      this.setupSubscriptionListener();
    } catch (error) {
      console.error('Failed to initialize feature gates:', error);
    }
  }

  // Check if user has access to a feature
  async checkAccess(feature: string): Promise<FeatureAccess> {
    try {
      // Check cache first
      const cached = this.cache.get(feature);
      if (cached && Date.now() - this.lastFetchTime < this.cacheExpiry) {
        return cached;
      }

      // Refresh subscription if needed
      if (Date.now() - this.lastFetchTime > this.cacheExpiry) {
        this.subscription = await StripePaymentService.getSubscriptionStatus();
        this.lastFetchTime = Date.now();
      }

      // Determine access based on subscription tier
      const userTier = this.getUserTier();
      const allowedTiers = this.featureMatrix[feature] || [];
      const hasAccess = allowedTiers.includes(userTier);

      const access: FeatureAccess = {
        hasAccess,
        requiredTier: this.getRequiredTier(feature),
        reason: hasAccess ? undefined : this.getAccessDeniedReason(feature, userTier),
      };

      // Cache result
      this.cache.set(feature, access);
      await this.saveCachedFeatures();

      // Track feature gate check
      await this.trackFeatureGateCheck(feature, hasAccess);

      return access;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  }

  // Check multiple features at once
  async checkMultipleAccess(features: string[]): Promise<Map<string, FeatureAccess>> {
    const results = new Map<string, FeatureAccess>();
    
    await Promise.all(
      features.map(async (feature) => {
        const access = await this.checkAccess(feature);
        results.set(feature, access);
      })
    );
    
    return results;
  }

  // Get user's current tier
  private getUserTier(): 'Free' | 'Premium' | 'Elite' {
    if (!this.subscription || !this.isSubscriptionActive()) {
      return 'Free';
    }
    return this.subscription.tier;
  }

  // Check if subscription is active
  private isSubscriptionActive(): boolean {
    if (!this.subscription) return false;
    return ['active', 'trialing'].includes(this.subscription.status);
  }

  // Get required tier for a feature
  private getRequiredTier(feature: string): 'Premium' | 'Elite' | undefined {
    const allowedTiers = this.featureMatrix[feature];
    if (!allowedTiers || allowedTiers.length === 0) return undefined;
    
    if (allowedTiers.includes('Premium')) return 'Premium';
    if (allowedTiers.includes('Elite')) return 'Elite';
    return undefined;
  }

  // Get reason for access denial
  private getAccessDeniedReason(feature: string, userTier: string): string {
    const requiredTier = this.getRequiredTier(feature);
    
    if (!requiredTier) {
      return 'This feature is not available';
    }
    
    if (userTier === 'Free') {
      return `Upgrade to ${requiredTier} to unlock this feature`;
    }
    
    if (userTier === 'Premium' && requiredTier === 'Elite') {
      return 'This is an Elite-only feature';
    }
    
    return 'Subscription required';
  }

  // Check if user is in trial period
  async isInTrial(): Promise<boolean> {
    if (!this.subscription) return false;
    return this.subscription.status === 'trialing';
  }

  // Get trial days remaining
  async getTrialDaysRemaining(): Promise<number> {
    if (!this.subscription || this.subscription.status !== 'trialing') {
      return 0;
    }
    
    if (!this.subscription.trialEnd) return 0;
    
    const trialEnd = new Date(this.subscription.trialEnd);
    const now = new Date();
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysRemaining);
  }

  // Check usage limits for free tier
  async checkUsageLimit(limitType: 'workouts' | 'aiChats'): Promise<{
    withinLimit: boolean;
    used: number;
    limit: number;
  }> {
    const userTier = this.getUserTier();
    
    if (userTier !== 'Free') {
      return { withinLimit: true, used: 0, limit: Infinity };
    }
    
    const limits = SUBSCRIPTION_PLANS.FREE.limitations;
    let used = 0;
    let limit = 0;
    
    switch (limitType) {
      case 'workouts':
        limit = limits.workoutsPerWeek || 3;
        used = await this.getWeeklyWorkoutCount();
        break;
      case 'aiChats':
        limit = limits.ariaChatsPerDay || 3;
        used = await this.getDailyAiChatCount();
        break;
    }
    
    return {
      withinLimit: used < limit,
      used,
      limit,
    };
  }

  // Get weekly workout count
  private async getWeeklyWorkoutCount(): Promise<number> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('id')
        .gte('created_at', startOfWeek.toISOString())
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error getting workout count:', error);
      return 0;
    }
  }

  // Get daily AI chat count
  private async getDailyAiChatCount(): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('ai_chats')
        .select('id')
        .gte('created_at', startOfDay.toISOString())
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error getting AI chat count:', error);
      return 0;
    }
  }

  // Set up real-time subscription listener
  private setupSubscriptionListener(): void {
    supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${this.subscription?.userId}`,
        },
        (payload) => {
          this.handleSubscriptionChange(payload);
        }
      )
      .subscribe();
  }

  // Handle subscription changes
  private async handleSubscriptionChange(payload: any): Promise<void> {
    console.log('Subscription changed:', payload);
    
    // Update local subscription
    this.subscription = payload.new;
    
    // Clear cache
    this.cache.clear();
    this.lastFetchTime = 0;
    
    // Notify app of subscription change
    await this.notifySubscriptionChange();
  }

  // Notify app of subscription change
  private async notifySubscriptionChange(): Promise<void> {
    // This would trigger UI updates, refresh screens, etc.
    // Implementation depends on your state management solution
  }

  // Load cached features from storage
  private async loadCachedFeatures(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('feature_access_cache');
      if (cached) {
        const data: CachedFeatureAccess = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          if (Date.now() - value.timestamp < this.cacheExpiry) {
            this.cache.set(key, { hasAccess: value.hasAccess });
          }
        });
      }
    } catch (error) {
      console.error('Error loading cached features:', error);
    }
  }

  // Save cached features to storage
  private async saveCachedFeatures(): Promise<void> {
    try {
      const data: CachedFeatureAccess = {};
      this.cache.forEach((value, key) => {
        data[key] = {
          hasAccess: value.hasAccess,
          timestamp: Date.now(),
        };
      });
      await AsyncStorage.setItem('feature_access_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cached features:', error);
    }
  }

  // Track feature gate checks for analytics
  private async trackFeatureGateCheck(
    feature: string,
    hasAccess: boolean
  ): Promise<void> {
    try {
      await supabase.from('analytics_events').insert({
        event_name: 'feature_gate_check',
        event_properties: {
          feature,
          hasAccess,
          tier: this.getUserTier(),
          isTrialing: this.subscription?.status === 'trialing',
        },
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking feature gate check:', error);
    }
  }

  // Clear all caches
  async clearCache(): Promise<void> {
    this.cache.clear();
    this.lastFetchTime = 0;
    await AsyncStorage.removeItem('feature_access_cache');
  }
}

export default FeatureGateService.getInstance();