import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RevenueMetrics, Subscription, Payment } from '../../types/payments';
import { SUBSCRIPTION_PLANS } from '../../constants/subscriptions';

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
}

interface CohortData {
  cohort: string;
  users: number;
  revenue: number;
  retention: number;
  ltv: number;
}

class RevenueAnalytics {
  private static instance: RevenueAnalytics;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RevenueAnalytics {
    if (!RevenueAnalytics.instance) {
      RevenueAnalytics.instance = new RevenueAnalytics();
    }
    return RevenueAnalytics.instance;
  }

  // Initialize analytics
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // Process any queued events
    await this.processEventQueue();
    
    // Start periodic sync
    setInterval(() => this.syncAnalytics(), 60000); // Sync every minute
  }

  // Track revenue event
  async trackRevenueEvent(
    eventName: string,
    revenue?: number,
    properties?: Record<string, any>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        revenue,
        timestamp: new Date(),
      },
    };

    // Add to queue
    this.eventQueue.push(event);
    
    // Store locally
    await this.storeEventLocally(event);
    
    // Process immediately if important event
    if (this.isImportantEvent(eventName)) {
      await this.processEvent(event);
    }
  }

  // Track subscription metrics
  async trackSubscriptionMetrics(
    subscription: Subscription,
    eventType: 'new' | 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'
  ): Promise<void> {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(
      p => p.id === subscription.tier.toLowerCase()
    );
    
    const revenue = plan?.price || 0;
    const interval = plan?.interval || 'month';
    
    // Calculate MRR/ARR
    const mrr = interval === 'month' ? revenue : revenue / 12;
    const arr = mrr * 12;
    
    await this.trackRevenueEvent(`subscription_${eventType}`, mrr, {
      tier: subscription.tier,
      price: revenue,
      interval,
      mrr,
      arr,
      userId: subscription.userId,
      isTrialing: subscription.status === 'trialing',
    });
    
    // Update cohort data
    await this.updateCohortData(subscription.userId, eventType);
  }

  // Get revenue metrics
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    try {
      const { data: metrics } = await supabase
        .from('revenue_metrics')
        .select('*')
        .single();
      
      if (!metrics) {
        return this.calculateRevenueMetrics();
      }
      
      return metrics;
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // Calculate revenue metrics from raw data
  private async calculateRevenueMetrics(): Promise<RevenueMetrics> {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trialing']);
    
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'succeeded')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    // Calculate MRR
    let mrr = 0;
    let revenueByTier: Record<string, number> = {
      Free: 0,
      Premium: 0,
      Elite: 0,
    };
    
    subscriptions?.forEach(sub => {
      const plan = Object.values(SUBSCRIPTION_PLANS).find(
        p => p.id === sub.tier.toLowerCase()
      );
      if (plan && sub.status === 'active') {
        const monthlyRevenue = plan.interval === 'month' ? plan.price : plan.price / 12;
        mrr += monthlyRevenue;
        revenueByTier[sub.tier] = (revenueByTier[sub.tier] || 0) + monthlyRevenue;
      }
    });
    
    // Calculate other metrics
    const activeUsers = subscriptions?.filter(s => s.status === 'active').length || 0;
    const trialingUsers = subscriptions?.filter(s => s.status === 'trialing').length || 0;
    const arpu = activeUsers > 0 ? mrr / activeUsers : 0;
    
    // Calculate churn rate (simplified)
    const { data: canceledLastMonth } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'canceled')
      .gte('canceled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const churnRate = activeUsers > 0 ? (canceledLastMonth?.length || 0) / activeUsers : 0;
    
    // Calculate LTV (simplified: ARPU / churn rate)
    const ltv = churnRate > 0 ? arpu / churnRate : arpu * 24; // Assume 24 month LTV if no churn
    
    // Calculate trial conversion rate
    const { data: convertedTrials } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'trial_converted')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const { data: startedTrials } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'trial_started')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const trialConversionRate = startedTrials?.length > 0 
      ? (convertedTrials?.length || 0) / startedTrials.length 
      : 0;
    
    // Get top features by usage
    const topFeatures = await this.getTopFeaturesByUsage();
    
    return {
      mrr,
      arr: mrr * 12,
      arpu,
      ltv,
      churnRate,
      trialConversionRate,
      averageSubscriptionLength: 6, // Placeholder
      revenueByTier,
      topFeaturesByUsage: topFeatures,
    };
  }

  // Get conversion funnel data
  async getConversionFunnel(
    startDate?: Date,
    endDate?: Date
  ): Promise<ConversionFunnel[]> {
    const dateFilter = {
      ...(startDate && { gte: startDate.toISOString() }),
      ...(endDate && { lte: endDate.toISOString() }),
    };
    
    // Define funnel stages
    const stages = [
      'app_opened',
      'onboarding_started',
      'onboarding_completed',
      'paywall_viewed',
      'trial_started',
      'payment_initiated',
      'subscription_created',
    ];
    
    const funnel: ConversionFunnel[] = [];
    let previousCount = 0;
    
    for (const stage of stages) {
      const { data, count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact' })
        .eq('event_name', stage)
        .match(dateFilter);
      
      const stageCount = count || 0;
      const conversionRate = previousCount > 0 ? stageCount / previousCount : 1;
      
      funnel.push({
        stage,
        count: stageCount,
        conversionRate,
      });
      
      previousCount = stageCount;
    }
    
    return funnel;
  }

  // Get cohort analysis
  async getCohortAnalysis(
    cohortType: 'monthly' | 'weekly' = 'monthly'
  ): Promise<CohortData[]> {
    const cohorts: CohortData[] = [];
    const now = new Date();
    
    // Get last 6 cohorts
    for (let i = 0; i < 6; i++) {
      const cohortStart = new Date(now);
      if (cohortType === 'monthly') {
        cohortStart.setMonth(cohortStart.getMonth() - i);
        cohortStart.setDate(1);
      } else {
        cohortStart.setDate(cohortStart.getDate() - (i * 7));
      }
      
      const cohortEnd = new Date(cohortStart);
      if (cohortType === 'monthly') {
        cohortEnd.setMonth(cohortEnd.getMonth() + 1);
      } else {
        cohortEnd.setDate(cohortEnd.getDate() + 7);
      }
      
      // Get users in this cohort
      const { data: cohortUsers } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', cohortStart.toISOString())
        .lt('created_at', cohortEnd.toISOString());
      
      // Get revenue from this cohort
      const { data: cohortPayments } = await supabase
        .from('payments')
        .select('*')
        .in('user_id', cohortUsers?.map(u => u.id) || [])
        .eq('status', 'succeeded');
      
      const totalRevenue = cohortPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      
      // Calculate retention (simplified)
      const { data: activeUsers } = await supabase
        .from('subscriptions')
        .select('*')
        .in('user_id', cohortUsers?.map(u => u.id) || [])
        .eq('status', 'active');
      
      const retention = cohortUsers?.length > 0 
        ? (activeUsers?.length || 0) / cohortUsers.length 
        : 0;
      
      // Calculate LTV for cohort
      const cohortLTV = cohortUsers?.length > 0 
        ? totalRevenue / cohortUsers.length 
        : 0;
      
      cohorts.push({
        cohort: cohortStart.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        users: cohortUsers?.length || 0,
        revenue: totalRevenue,
        retention,
        ltv: cohortLTV,
      });
    }
    
    return cohorts;
  }

  // Get feature usage analytics
  async getFeatureUsageAnalytics(): Promise<Record<string, number>> {
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'feature_used')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const usage: Record<string, number> = {};
    
    events?.forEach(event => {
      const feature = event.event_properties?.feature;
      if (feature) {
        usage[feature] = (usage[feature] || 0) + 1;
      }
    });
    
    return usage;
  }

  // Get paywall performance
  async getPaywallPerformance(): Promise<{
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenuePerImpression: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { count: impressions } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_name', 'paywall_impression')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const { count: clicks } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_name', 'paywall_upgrade_clicked')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const { count: conversions } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .eq('event_name', 'paywall_conversion')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const { data: revenue } = await supabase
      .from('payments')
      .select('amount')
      .eq('source', 'paywall')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const totalRevenue = revenue?.reduce((sum, p) => sum + p.amount, 0) || 0;
    
    return {
      impressions: impressions || 0,
      clicks: clicks || 0,
      conversions: conversions || 0,
      conversionRate: (impressions || 0) > 0 ? (conversions || 0) / (impressions || 0) : 0,
      revenuePerImpression: (impressions || 0) > 0 ? totalRevenue / (impressions || 0) : 0,
    };
  }

  // Track A/B test results
  async trackABTestResult(
    testName: string,
    variant: string,
    converted: boolean,
    revenue?: number
  ): Promise<void> {
    await this.trackRevenueEvent('ab_test_result', revenue, {
      testName,
      variant,
      converted,
    });
  }

  // Get A/B test results
  async getABTestResults(testName: string): Promise<{
    variants: Record<string, {
      impressions: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
    }>;
    winner?: string;
  }> {
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'ab_test_result')
      .eq('event_properties->testName', testName);
    
    const variants: Record<string, any> = {};
    
    events?.forEach(event => {
      const variant = event.event_properties?.variant;
      if (!variant) return;
      
      if (!variants[variant]) {
        variants[variant] = {
          impressions: 0,
          conversions: 0,
          revenue: 0,
        };
      }
      
      variants[variant].impressions++;
      if (event.event_properties?.converted) {
        variants[variant].conversions++;
        variants[variant].revenue += event.event_properties?.revenue || 0;
      }
    });
    
    // Calculate conversion rates and determine winner
    let winner: string | undefined;
    let highestRate = 0;
    
    Object.entries(variants).forEach(([variant, data]) => {
      data.conversionRate = data.impressions > 0 
        ? data.conversions / data.impressions 
        : 0;
      
      if (data.conversionRate > highestRate && data.impressions >= 100) {
        highestRate = data.conversionRate;
        winner = variant;
      }
    });
    
    return { variants, winner };
  }

  // Helper methods
  private async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    const events = await this.getStoredEvents();
    events.push(event);
    await AsyncStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
  }

  private async getStoredEvents(): Promise<AnalyticsEvent[]> {
    const stored = await AsyncStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await supabase.from('analytics_events').insert({
        event_name: event.eventName,
        event_properties: event.properties,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error processing analytics event:', error);
      // Re-add to queue for retry
      this.eventQueue.push(event);
    }
  }

  private isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'subscription_created',
      'subscription_canceled',
      'payment_succeeded',
      'payment_failed',
      'trial_started',
      'trial_converted',
    ];
    return importantEvents.includes(eventName);
  }

  private async syncAnalytics(): Promise<void> {
    await this.processEventQueue();
  }

  private async getTopFeaturesByUsage(): Promise<string[]> {
    const usage = await this.getFeatureUsageAnalytics();
    return Object.entries(usage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([feature]) => feature);
  }

  private async updateCohortData(userId: string, eventType: string): Promise<void> {
    // Update cohort data in database
    await supabase.from('cohort_data').upsert({
      user_id: userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
    });
  }

  private getDefaultMetrics(): RevenueMetrics {
    return {
      mrr: 0,
      arr: 0,
      arpu: 0,
      ltv: 0,
      churnRate: 0,
      trialConversionRate: 0,
      averageSubscriptionLength: 0,
      revenueByTier: { Free: 0, Premium: 0, Elite: 0 },
      topFeaturesByUsage: [],
    };
  }
}

export default RevenueAnalytics.getInstance();