import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedAnalyticsService from './analytics.enhanced';

// A/B Test definitions
export const AB_TESTS = {
  // Button color tests
  CTA_BUTTON_COLOR: {
    id: 'cta_button_color',
    name: 'CTA Button Color Test',
    variants: {
      control: { color: '#6C63FF', name: 'Purple' },
      variant_a: { color: '#4ECDC4', name: 'Teal' },
      variant_b: { color: '#FF6B6B', name: 'Red' },
    },
    allocation: [34, 33, 33], // Percentage for each variant
  },
  
  // Copy variations
  ONBOARDING_WELCOME_COPY: {
    id: 'onboarding_welcome_copy',
    name: 'Welcome Screen Copy Test',
    variants: {
      control: {
        title: 'Welcome to Catalyft',
        subtitle: 'Your AI-powered fitness companion',
        cta: 'Get Started',
      },
      variant_a: {
        title: 'Transform Your Body',
        subtitle: 'Start your fitness journey today',
        cta: 'Start Now',
      },
      variant_b: {
        title: 'Achieve Your Goals',
        subtitle: 'Personalized workouts that work',
        cta: 'Begin Journey',
      },
    },
    allocation: [34, 33, 33],
  },
  
  // Onboarding flow variations
  ONBOARDING_STEPS: {
    id: 'onboarding_steps',
    name: 'Onboarding Flow Length',
    variants: {
      control: { steps: ['welcome', 'goals', 'assessment', 'personalization', 'plan', 'tutorial'] },
      simplified: { steps: ['welcome', 'goals', 'plan'] },
      detailed: { steps: ['welcome', 'goals', 'assessment', 'body_metrics', 'personalization', 'plan', 'tutorial', 'first_workout'] },
    },
    allocation: [50, 25, 25],
  },
  
  // Button text variations
  SUBSCRIPTION_CTA: {
    id: 'subscription_cta',
    name: 'Subscription CTA Text',
    variants: {
      control: { text: 'Start 7-Day Free Trial', emphasis: 'free' },
      variant_a: { text: 'Unlock Premium Features', emphasis: 'features' },
      variant_b: { text: 'Try Premium Risk-Free', emphasis: 'risk' },
      variant_c: { text: 'Get Unlimited Access', emphasis: 'unlimited' },
    },
    allocation: [25, 25, 25, 25],
  },
  
  // Progressive disclosure test
  PROGRESSIVE_DISCLOSURE: {
    id: 'progressive_disclosure',
    name: 'Progressive Disclosure in Onboarding',
    variants: {
      all_upfront: { 
        strategy: 'all_fields_visible',
        required_fields: ['all'],
      },
      progressive: { 
        strategy: 'show_fields_progressively',
        required_fields: ['minimal'],
      },
      optional_later: { 
        strategy: 'defer_optional_fields',
        required_fields: ['essential_only'],
      },
    },
    allocation: [33, 34, 33],
  },
};

// Test results interface
interface TestResult {
  testId: string;
  variant: string;
  userId: string;
  timestamp: number;
  converted: boolean;
  conversionValue?: number;
  metadata?: Record<string, any>;
}

class ABTestingService {
  private static instance: ABTestingService;
  private assignments: Map<string, string> = new Map();
  private results: TestResult[] = [];
  private userId: string | null = null;
  
  private constructor() {}
  
  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }
  
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadAssignments();
    await this.assignToTests();
  }
  
  private async loadAssignments(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(`ab_assignments_${this.userId}`);
      if (stored) {
        const assignments = JSON.parse(stored);
        Object.entries(assignments).forEach(([key, value]) => {
          this.assignments.set(key, value as string);
        });
      }
    } catch (error) {
      console.error('Failed to load AB test assignments:', error);
    }
  }
  
  private async saveAssignments(): Promise<void> {
    try {
      const assignments = Object.fromEntries(this.assignments);
      await AsyncStorage.setItem(
        `ab_assignments_${this.userId}`,
        JSON.stringify(assignments)
      );
    } catch (error) {
      console.error('Failed to save AB test assignments:', error);
    }
  }
  
  private async assignToTests(): Promise<void> {
    for (const [testKey, test] of Object.entries(AB_TESTS)) {
      if (!this.assignments.has(test.id)) {
        const variant = this.selectVariant(test);
        this.assignments.set(test.id, variant);
        
        // Track assignment
        EnhancedAnalyticsService.track('ab_test_assigned', {
          test_id: test.id,
          test_name: test.name,
          variant,
          user_id: this.userId,
        });
      }
    }
    
    await this.saveAssignments();
  }
  
  private selectVariant(test: any): string {
    const random = Math.random() * 100;
    let cumulative = 0;
    const variants = Object.keys(test.variants);
    
    for (let i = 0; i < variants.length; i++) {
      cumulative += test.allocation[i];
      if (random <= cumulative) {
        return variants[i];
      }
    }
    
    return variants[0]; // Fallback to control
  }
  
  // Get variant for a specific test
  getVariant<T = any>(testId: string): { variant: string; config: T } | null {
    const variant = this.assignments.get(testId);
    if (!variant) return null;
    
    const test = Object.values(AB_TESTS).find(t => t.id === testId);
    if (!test) return null;
    
    return {
      variant,
      config: (test.variants as any)[variant],
    };
  }
  
  // Get button color variant
  getButtonColor(): string {
    const result = this.getVariant<{ color: string }>(AB_TESTS.CTA_BUTTON_COLOR.id);
    return result?.config.color || '#6C63FF'; // Default purple
  }
  
  // Get copy variant
  getCopyVariant(testId: string): Record<string, string> {
    const result = this.getVariant<Record<string, string>>(testId);
    return result?.config || {};
  }
  
  // Track conversion
  trackConversion(testId: string, value?: number, metadata?: Record<string, any>): void {
    const variant = this.assignments.get(testId);
    if (!variant) return;
    
    const result: TestResult = {
      testId,
      variant,
      userId: this.userId || 'anonymous',
      timestamp: Date.now(),
      converted: true,
      conversionValue: value,
      metadata,
    };
    
    this.results.push(result);
    
    // Track in analytics
    EnhancedAnalyticsService.track('ab_test_conversion', {
      test_id: testId,
      variant,
      conversion_value: value,
      ...metadata,
    });
  }
  
  // Track interaction
  trackInteraction(testId: string, action: string, metadata?: Record<string, any>): void {
    const variant = this.assignments.get(testId);
    if (!variant) return;
    
    EnhancedAnalyticsService.track('ab_test_interaction', {
      test_id: testId,
      variant,
      action,
      ...metadata,
    });
  }
  
  // Get test results summary
  getTestResults(testId: string): {
    control: { conversions: number; rate: number };
    variants: Record<string, { conversions: number; rate: number }>;
  } {
    const testResults = this.results.filter(r => r.testId === testId);
    const variants = new Set(testResults.map(r => r.variant));
    
    const summary: any = {
      control: { conversions: 0, rate: 0 },
      variants: {},
    };
    
    variants.forEach(variant => {
      const conversions = testResults.filter(r => r.variant === variant && r.converted).length;
      const total = testResults.filter(r => r.variant === variant).length;
      const rate = total > 0 ? (conversions / total) * 100 : 0;
      
      if (variant === 'control') {
        summary.control = { conversions, rate };
      } else {
        summary.variants[variant] = { conversions, rate };
      }
    });
    
    return summary;
  }
  
  // Check if user should see progressive disclosure
  shouldUseProgressiveDisclosure(): boolean {
    const result = this.getVariant(AB_TESTS.PROGRESSIVE_DISCLOSURE.id);
    return result?.variant !== 'all_upfront';
  }
  
  // Get required fields based on progressive disclosure variant
  getRequiredFields(): string[] {
    const result = this.getVariant<{ required_fields: string[] }>(
      AB_TESTS.PROGRESSIVE_DISCLOSURE.id
    );
    
    if (!result) return ['all'];
    
    switch (result.config.required_fields[0]) {
      case 'minimal':
        return ['goals', 'fitness_level'];
      case 'essential_only':
        return ['goals', 'fitness_level', 'workout_frequency'];
      default:
        return ['all'];
    }
  }
  
  // Override variant for testing
  overrideVariant(testId: string, variant: string): void {
    if (__DEV__) {
      this.assignments.set(testId, variant);
      console.log(`Overrode test ${testId} to variant ${variant}`);
    }
  }
  
  // Reset all assignments
  async reset(): Promise<void> {
    this.assignments.clear();
    this.results = [];
    if (this.userId) {
      await AsyncStorage.removeItem(`ab_assignments_${this.userId}`);
    }
  }
}

export default ABTestingService.getInstance();