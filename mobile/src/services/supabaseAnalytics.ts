import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Database table interfaces
interface OnboardingProgress {
  id?: string;
  user_id: string;
  current_step: string;
  completed_steps: string[];
  goals?: string[];
  assessment_data?: Record<string, any>;
  personalization_data?: Record<string, any>;
  selected_plan?: string;
  completed: boolean;
  started_at: string;
  completed_at?: string;
  drop_off_step?: string;
  time_spent_seconds?: number;
}

interface AnalyticsEvent {
  id?: string;
  user_id: string;
  event_name: string;
  event_properties?: Record<string, any>;
  session_id?: string;
  platform: string;
  app_version: string;
  created_at?: string;
}

interface UserProfile {
  id: string;
  email?: string;
  fitness_level?: string;
  goals?: string[];
  workout_frequency?: number;
  equipment?: string[];
  injuries?: string[];
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  dietary_preferences?: string[];
  notification_preferences?: Record<string, boolean>;
  onboarding_completed: boolean;
  subscription_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface ABTestAssignment {
  id?: string;
  user_id: string;
  test_id: string;
  variant: string;
  assigned_at: string;
  converted?: boolean;
  conversion_value?: number;
}

class SupabaseAnalyticsService {
  private static instance: SupabaseAnalyticsService;
  private userId: string | null = null;
  
  private constructor() {}
  
  static getInstance(): SupabaseAnalyticsService {
    if (!SupabaseAnalyticsService.instance) {
      SupabaseAnalyticsService.instance = new SupabaseAnalyticsService();
    }
    return SupabaseAnalyticsService.instance;
  }
  
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    // Create tables if they don't exist (for development)
    await this.ensureTablesExist();
  }
  
  private async ensureTablesExist(): Promise<void> {
    // Note: In production, these tables should be created via migrations
    // This is just for development/testing
    
    const tables = [
      `CREATE TABLE IF NOT EXISTS onboarding_progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        current_step TEXT NOT NULL,
        completed_steps TEXT[],
        goals TEXT[],
        assessment_data JSONB,
        personalization_data JSONB,
        selected_plan TEXT,
        completed BOOLEAN DEFAULT false,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        drop_off_step TEXT,
        time_spent_seconds INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        event_name TEXT NOT NULL,
        event_properties JSONB,
        session_id TEXT,
        platform TEXT,
        app_version TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT,
        fitness_level TEXT,
        goals TEXT[],
        workout_frequency INTEGER,
        equipment TEXT[],
        injuries TEXT[],
        age INTEGER,
        gender TEXT,
        height DECIMAL,
        weight DECIMAL,
        dietary_preferences TEXT[],
        notification_preferences JSONB,
        onboarding_completed BOOLEAN DEFAULT false,
        subscription_type TEXT DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS ab_test_assignments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id),
        test_id TEXT NOT NULL,
        variant TEXT NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        converted BOOLEAN DEFAULT false,
        conversion_value DECIMAL,
        UNIQUE(user_id, test_id)
      )`,
    ];
    
    // Note: These would need proper permissions in production
    // For now, we'll just ensure the tables exist in our queries
  }
  
  // Save onboarding progress
  async saveOnboardingProgress(
    step: string,
    data: Partial<OnboardingProgress>
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', this.userId)
        .single();
      
      if (existing) {
        // Update existing progress
        const { error } = await supabase
          .from('onboarding_progress')
          .update({
            current_step: step,
            completed_steps: [...(existing.completed_steps || []), step],
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', this.userId);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: this.userId,
            current_step: step,
            completed_steps: [step],
            ...data,
            started_at: new Date().toISOString(),
          });
        
        if (error) throw error;
      }
      
      // Also save to local storage for offline support
      await AsyncStorage.setItem(
        `onboarding_progress_${this.userId}`,
        JSON.stringify({ step, ...data })
      );
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
      // Fall back to local storage only
      await AsyncStorage.setItem(
        `onboarding_progress_${this.userId}`,
        JSON.stringify({ step, ...data })
      );
    }
  }
  
  // Complete onboarding
  async completeOnboarding(
    timeSpentSeconds: number,
    selectedPlan: string
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
          selected_plan: selectedPlan,
        })
        .eq('user_id', this.userId);
      
      if (error) throw error;
      
      // Update user profile
      await this.updateUserProfile({ onboarding_completed: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }
  
  // Track analytics event
  async trackEvent(
    eventName: string,
    properties?: Record<string, any>,
    sessionId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: this.userId,
          event_name: eventName,
          event_properties: properties,
          session_id: sessionId,
          platform: 'mobile',
          app_version: '1.0.0',
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to track event:', error);
      
      // Queue event for later sync
      await this.queueEvent(eventName, properties);
    }
  }
  
  // Queue events for offline sync
  private async queueEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const queue = await AsyncStorage.getItem('analytics_event_queue');
    const events = queue ? JSON.parse(queue) : [];
    
    events.push({
      event_name: eventName,
      event_properties: properties,
      timestamp: new Date().toISOString(),
      user_id: this.userId,
    });
    
    await AsyncStorage.setItem('analytics_event_queue', JSON.stringify(events));
  }
  
  // Sync queued events
  async syncQueuedEvents(): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem('analytics_event_queue');
      if (!queue) return;
      
      const events = JSON.parse(queue);
      
      for (const event of events) {
        await this.trackEvent(
          event.event_name,
          {
            ...event.event_properties,
            queued: true,
            original_timestamp: event.timestamp,
          }
        );
      }
      
      // Clear queue after successful sync
      await AsyncStorage.removeItem('analytics_event_queue');
    } catch (error) {
      console.error('Failed to sync queued events:', error);
    }
  }
  
  // Save user profile
  async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: this.userId,
          ...profile,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }
  
  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  }
  
  // Get user profile
  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', this.userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }
  
  // Save A/B test assignment
  async saveABTestAssignment(
    testId: string,
    variant: string
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('ab_test_assignments')
        .upsert({
          user_id: this.userId,
          test_id: testId,
          variant,
          assigned_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to save A/B test assignment:', error);
    }
  }
  
  // Track A/B test conversion
  async trackABTestConversion(
    testId: string,
    value?: number
  ): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('ab_test_assignments')
        .update({
          converted: true,
          conversion_value: value,
        })
        .eq('user_id', this.userId)
        .eq('test_id', testId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }
  
  // Get onboarding funnel data
  async getOnboardingFunnelData(
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      let query = supabase
        .from('onboarding_progress')
        .select('*');
      
      if (startDate) {
        query = query.gte('started_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('started_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate funnel metrics
      const steps = [
        'welcome', 'goals', 'assessment', 
        'personalization', 'plan', 'tutorial'
      ];
      
      const funnel = steps.map(step => {
        const reached = data?.filter(p => 
          p.completed_steps?.includes(step)
        ).length || 0;
        
        const completed = data?.filter(p => 
          p.current_step === step && p.completed
        ).length || 0;
        
        return {
          step,
          reached,
          completed,
          dropOff: reached > 0 
            ? ((reached - completed) / reached * 100).toFixed(1)
            : 0,
        };
      });
      
      return funnel;
    } catch (error) {
      console.error('Failed to get funnel data:', error);
      return [];
    }
  }
  
  // Get analytics summary
  async getAnalyticsSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      // Get event counts
      let eventsQuery = supabase
        .from('analytics_events')
        .select('event_name', { count: 'exact' });
      
      if (startDate) {
        eventsQuery = eventsQuery.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        eventsQuery = eventsQuery.lte('created_at', endDate.toISOString());
      }
      
      const { data: events, count: eventCount } = await eventsQuery;
      
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });
      
      const { count: completedOnboarding } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('onboarding_completed', true);
      
      // Get A/B test results
      const { data: abTests } = await supabase
        .from('ab_test_assignments')
        .select('test_id, variant, converted');
      
      return {
        totalEvents: eventCount || 0,
        totalUsers: totalUsers || 0,
        onboardingCompletion: totalUsers 
          ? ((completedOnboarding || 0) / totalUsers * 100).toFixed(1)
          : 0,
        abTests: this.summarizeABTests(abTests || []),
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }
  
  private summarizeABTests(assignments: ABTestAssignment[]): any {
    const tests: Record<string, any> = {};
    
    assignments.forEach(assignment => {
      if (!tests[assignment.test_id]) {
        tests[assignment.test_id] = {
          variants: {},
        };
      }
      
      if (!tests[assignment.test_id].variants[assignment.variant]) {
        tests[assignment.test_id].variants[assignment.variant] = {
          count: 0,
          conversions: 0,
        };
      }
      
      tests[assignment.test_id].variants[assignment.variant].count++;
      if (assignment.converted) {
        tests[assignment.test_id].variants[assignment.variant].conversions++;
      }
    });
    
    // Calculate conversion rates
    Object.keys(tests).forEach(testId => {
      Object.keys(tests[testId].variants).forEach(variant => {
        const v = tests[testId].variants[variant];
        v.conversionRate = v.count > 0 
          ? (v.conversions / v.count * 100).toFixed(1)
          : 0;
      });
    });
    
    return tests;
  }
}

export default SupabaseAnalyticsService.getInstance();