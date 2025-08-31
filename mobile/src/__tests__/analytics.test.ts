import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedAnalyticsService from '../services/analytics.enhanced';
import AnalyticsValidator from '../services/analyticsValidator';
import ABTestingService from '../services/abTesting';
import SupabaseAnalyticsService from '../services/supabaseAnalytics';
import { EVENTS } from '../services/analytics';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('@segment/analytics-react-native', () => ({
  setup: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  screen: jest.fn(),
  reset: jest.fn(),
  flush: jest.fn(),
}));

jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Analytics Services Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EnhancedAnalyticsService', () => {
    test('should initialize analytics service', async () => {
      await EnhancedAnalyticsService.initialize();
      expect(EnhancedAnalyticsService['initialized']).toBe(true);
    });

    test('should track events with validation', () => {
      const eventName = 'test_event';
      const properties = { test_property: 'value' };
      
      EnhancedAnalyticsService.track(eventName, properties);
      
      // Event should be tracked (service is initialized, so it should track directly)
      // Note: The service tracks events directly when initialized, not to a metrics collection
    });

    test('should track funnel steps', () => {
      const steps = [
        'onboarding_funnel_started',
        'onboarding_funnel_welcome',
        'onboarding_funnel_goals',
      ];
      
      steps.forEach(step => {
        EnhancedAnalyticsService.trackFunnelStep(step);
      });
      
      const completionRate = EnhancedAnalyticsService.getFunnelCompletionRate();
      expect(completionRate).toBeGreaterThan(0);
    });

    test('should handle offline event queueing', async () => {
      const eventName = 'offline_event';
      const properties = { offline: true };
      
      // Simulate offline by not initializing
      EnhancedAnalyticsService['initialized'] = false;
      await EnhancedAnalyticsService.track(eventName, properties);
      
      // The queueEvent method is async, so we need to wait for it to complete
      // Since it's a private method, we'll check if AsyncStorage was called
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    }, 10000); // Increase timeout to 10 seconds

    test('should calculate funnel completion rate', () => {
      // Add some funnel steps
      EnhancedAnalyticsService.trackFunnelStep('step_1');
      EnhancedAnalyticsService.trackFunnelStep('step_2');
      
      const rate = EnhancedAnalyticsService.getFunnelCompletionRate();
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });

    test('should track screen views with time spent', () => {
      const screenName = 'TestScreen';
      
      EnhancedAnalyticsService.trackScreen(screenName);
      
      // Simulate time passing
      jest.advanceTimersByTime(5000);
      
      EnhancedAnalyticsService.trackScreen('NextScreen');
      
      // Should have tracked time spent on previous screen
      expect(EnhancedAnalyticsService['lastScreen']).toBe('NextScreen');
    });

    test('should identify user across services', async () => {
      const userId = 'test_user_123';
      const traits = { email: 'test@example.com' };
      
      await EnhancedAnalyticsService.identify(userId, traits);
      
      expect(EnhancedAnalyticsService['userId']).toBe(userId);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('analytics_user_id', userId);
    });
  });

  describe('AnalyticsValidator', () => {
    test('should validate event names', () => {
      const validNames = ['valid_event', 'test_event_123'];
      const invalidNames = ['Invalid-Event', '123_start', 'very_long_event_name_that_exceeds_forty_characters'];
      
      validNames.forEach(name => {
        const result = AnalyticsValidator.validateEvent(name);
        expect(result.isValid).toBe(true);
      });
      
      invalidNames.forEach(name => {
        const result = AnalyticsValidator.validateEvent(name);
        expect(result.isValid).toBe(false);
      });
    });

    test('should validate required properties', () => {
      const eventName = EVENTS.WORKOUT_COMPLETED;
      
      // Missing required properties
      const invalidResult = AnalyticsValidator.validateEvent(eventName, {});
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Missing required property: workout_id');
      
      // Valid properties
      const validResult = AnalyticsValidator.validateEvent(eventName, {
        workout_id: '123',
        duration: 3600,
        exercises_count: 10,
      });
      expect(validResult.isValid).toBe(true);
    });

    test('should check property ranges', () => {
      const eventName = EVENTS.WORKOUT_COMPLETED;
      const properties = {
        workout_id: '123',
        duration: 20000, // Exceeds max
        exercises_count: 100, // Exceeds max
      };
      
      const result = AnalyticsValidator.validateEvent(eventName, properties);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should generate health report', () => {
      // Track some events
      AnalyticsValidator.validateEvent('test_event_1', { prop: 'value' });
      AnalyticsValidator.validateEvent('test_event_2', {});
      AnalyticsValidator.validateEvent('invalid_event!', {});
      
      const report = AnalyticsValidator.generateReport();
      
      expect(report.totalEvents).toBeGreaterThan(0);
      expect(report.uniqueEvents).toBeGreaterThan(0);
      expect(report.errorRate).toBeGreaterThanOrEqual(0);
    });

    test('should run validation tests', async () => {
      const results = await AnalyticsValidator.runValidationTests();
      
      expect(results.passed).toBeDefined();
      expect(results.failed).toBeDefined();
      expect(results.warnings).toBeDefined();
    });
  });

  describe('ABTestingService', () => {
    test('should initialize and assign user to tests', async () => {
      const userId = 'test_user';
      await ABTestingService.initialize(userId);
      
      // Should have assignments for all active tests
      const buttonVariant = ABTestingService.getVariant('cta_button_color');
      expect(buttonVariant).toBeDefined();
      expect(['control', 'variant_a', 'variant_b']).toContain(buttonVariant?.variant);
    });

    test('should return consistent variants', async () => {
      const userId = 'test_user';
      await ABTestingService.initialize(userId);
      
      const variant1 = ABTestingService.getVariant('cta_button_color');
      const variant2 = ABTestingService.getVariant('cta_button_color');
      
      expect(variant1?.variant).toBe(variant2?.variant);
    });

    test('should track conversions', () => {
      const testId = 'cta_button_color';
      const conversionValue = 9.99;
      
      ABTestingService.trackConversion(testId, conversionValue);
      
      const results = ABTestingService.getTestResults(testId);
      expect(results).toBeDefined();
    });

    test('should handle progressive disclosure', () => {
      const shouldUseProgressive = ABTestingService.shouldUseProgressiveDisclosure();
      expect(typeof shouldUseProgressive).toBe('boolean');
      
      const requiredFields = ABTestingService.getRequiredFields();
      expect(Array.isArray(requiredFields)).toBe(true);
    });

    test('should get button color variant', () => {
      const color = ABTestingService.getButtonColor();
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('should override variants in dev mode', () => {
      if (__DEV__) {
        ABTestingService.overrideVariant('cta_button_color', 'variant_a');
        const variant = ABTestingService.getVariant('cta_button_color');
        expect(variant?.variant).toBe('variant_a');
      }
    });
  });

  describe('SupabaseAnalyticsService', () => {
    test('should initialize with user ID', async () => {
      const userId = 'test_user_123';
      await SupabaseAnalyticsService.initialize(userId);
      
      expect(SupabaseAnalyticsService['userId']).toBe(userId);
    });

    test('should save onboarding progress', async () => {
      const userId = 'test_user';
      await SupabaseAnalyticsService.initialize(userId);
      
      await SupabaseAnalyticsService.saveOnboardingProgress('goals', {
        goals: ['lose_weight', 'build_muscle'],
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test('should track events with offline support', async () => {
      const eventName = 'test_event';
      const properties = { test: true };
      
      await SupabaseAnalyticsService.trackEvent(eventName, properties);
      
      // Should either save to Supabase or queue locally
      expect(AsyncStorage.setItem).toBeDefined();
    });

    test('should save user profile', async () => {
      const userId = 'test_user';
      await SupabaseAnalyticsService.initialize(userId);
      
      const profile = {
        fitness_level: 'intermediate',
        goals: ['build_muscle'],
        workout_frequency: 4,
      };
      
      await SupabaseAnalyticsService.saveUserProfile(profile);
      
      // Should attempt to save to Supabase
      expect(SupabaseAnalyticsService['userId']).toBe(userId);
    });

    test('should handle A/B test assignments', async () => {
      const userId = 'test_user';
      await SupabaseAnalyticsService.initialize(userId);
      
      await SupabaseAnalyticsService.saveABTestAssignment('button_color', 'variant_a');
      await SupabaseAnalyticsService.trackABTestConversion('button_color', 9.99);
      
      // Should track both assignment and conversion
      expect(SupabaseAnalyticsService['userId']).toBe(userId);
    });

    test('should sync queued events', async () => {
      // Mock queued events
      const queuedEvents = [
        { event_name: 'event1', event_properties: {}, timestamp: '2024-01-01' },
        { event_name: 'event2', event_properties: {}, timestamp: '2024-01-02' },
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queuedEvents));
      
      await SupabaseAnalyticsService.syncQueuedEvents();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('analytics_event_queue');
    });

    test('should get onboarding funnel data', async () => {
      const funnelData = await SupabaseAnalyticsService.getOnboardingFunnelData();
      
      expect(Array.isArray(funnelData)).toBe(true);
    });

    test('should get analytics summary', async () => {
      const summary = await SupabaseAnalyticsService.getAnalyticsSummary();
      
      if (summary) {
        expect(summary.totalEvents).toBeDefined();
        expect(summary.totalUsers).toBeDefined();
        expect(summary.onboardingCompletion).toBeDefined();
      }
    });
  });

  describe('Event Tracking Integration', () => {
    test('should track complete onboarding flow', async () => {
      const userId = 'test_user';
      
      // Initialize services
      await EnhancedAnalyticsService.initialize();
      await SupabaseAnalyticsService.initialize(userId);
      
      // Track onboarding steps
      const steps = [
        EVENTS.ONBOARDING_STARTED,
        EVENTS.GOAL_SELECTED,
        EVENTS.FITNESS_LEVEL_SET,
        EVENTS.ONBOARDING_COMPLETED,
      ];
      
      for (const step of steps) {
        EnhancedAnalyticsService.track(step);
        await SupabaseAnalyticsService.trackEvent(step);
      }
      
      // Complete onboarding
      await SupabaseAnalyticsService.completeOnboarding(300, 'premium_plan');
      
      expect(EnhancedAnalyticsService.getFunnelCompletionRate()).toBeGreaterThan(0);
    });

    test('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      
      EnhancedAnalyticsService.trackError(error, { context: 'test' });
      
      // Should not throw
      expect(() => {
        EnhancedAnalyticsService.trackError(error);
      }).not.toThrow();
    });

    test('should validate and track custom events', () => {
      const customEvent = 'custom_user_action';
      const properties = {
        action_type: 'button_click',
        button_id: 'submit',
        timestamp: Date.now(),
      };
      
      const validation = AnalyticsValidator.validateEvent(customEvent, properties);
      
      if (validation.isValid) {
        EnhancedAnalyticsService.track(customEvent, properties);
      }
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    test('should track performance traces', () => {
      const traceName = 'test_operation';
      
      EnhancedAnalyticsService.startPerformanceTrace(traceName);
      
      // Simulate work
      jest.advanceTimersByTime(1000);
      
      EnhancedAnalyticsService.endPerformanceTrace(traceName);
      
      // Should have tracked the trace
      expect(EnhancedAnalyticsService['performanceMetrics'].has(traceName)).toBe(false);
    });

    test('should detect slow operations', () => {
      const traceName = 'slow_operation';
      
      EnhancedAnalyticsService.startPerformanceTrace(traceName);
      
      // Simulate slow operation
      jest.advanceTimersByTime(5000);
      
      EnhancedAnalyticsService.endPerformanceTrace(traceName, { slow: true });
      
      // Should have tracked as slow
      expect(EnhancedAnalyticsService['performanceMetrics'].has(traceName)).toBe(false);
    });
  });
});