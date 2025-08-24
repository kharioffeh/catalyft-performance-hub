import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedAnalyticsService from './analytics.enhanced';
import { EVENTS } from './analytics';

interface ValidationRule {
  eventName: string;
  requiredProperties: string[];
  propertyTypes?: Record<string, string>;
  propertyRanges?: Record<string, { min?: number; max?: number }>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EventMetrics {
  eventName: string;
  count: number;
  lastFired: number;
  averageProperties: number;
  errors: number;
}

class AnalyticsValidator {
  private static instance: AnalyticsValidator;
  private validationRules: Map<string, ValidationRule> = new Map();
  private eventMetrics: Map<string, EventMetrics> = new Map();
  private monitoring: boolean = false;
  private debugMode: boolean = __DEV__;
  
  private constructor() {
    this.initializeRules();
  }
  
  static getInstance(): AnalyticsValidator {
    if (!AnalyticsValidator.instance) {
      AnalyticsValidator.instance = new AnalyticsValidator();
    }
    return AnalyticsValidator.instance;
  }
  
  private initializeRules(): void {
    // Define validation rules for critical events
    this.validationRules.set(EVENTS.ONBOARDING_COMPLETED, {
      eventName: EVENTS.ONBOARDING_COMPLETED,
      requiredProperties: ['duration_seconds'],
      propertyTypes: {
        duration_seconds: 'number',
        skipped_steps: 'array',
      },
      propertyRanges: {
        duration_seconds: { min: 0, max: 3600 }, // Max 1 hour
      },
    });
    
    this.validationRules.set(EVENTS.WORKOUT_COMPLETED, {
      eventName: EVENTS.WORKOUT_COMPLETED,
      requiredProperties: ['workout_id', 'duration', 'exercises_count'],
      propertyTypes: {
        workout_id: 'string',
        duration: 'number',
        exercises_count: 'number',
        total_volume: 'number',
        pr_count: 'number',
      },
      propertyRanges: {
        duration: { min: 0, max: 10800 }, // Max 3 hours
        exercises_count: { min: 1, max: 50 },
      },
    });
    
    this.validationRules.set(EVENTS.SUBSCRIPTION_STARTED, {
      eventName: EVENTS.SUBSCRIPTION_STARTED,
      requiredProperties: ['plan', 'price', 'duration'],
      propertyTypes: {
        plan: 'string',
        price: 'number',
        duration: 'string',
        currency: 'string',
      },
      propertyRanges: {
        price: { min: 0, max: 1000 },
      },
    });
    
    // Add more rules for other critical events
    this.validationRules.set('funnel_drop_off_risk', {
      eventName: 'funnel_drop_off_risk',
      requiredProperties: ['from_step', 'to_step', 'time_between_steps'],
      propertyTypes: {
        from_step: 'string',
        to_step: 'string',
        time_between_steps: 'number',
      },
    });
  }
  
  validateEvent(eventName: string, properties?: Record<string, any>): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };
    
    // Check if event name is valid
    if (!this.isValidEventName(eventName)) {
      result.errors.push(`Invalid event name format: ${eventName}`);
      result.isValid = false;
    }
    
    // Check if we have validation rules for this event
    const rule = this.validationRules.get(eventName);
    if (!rule) {
      // No specific rules, but still track
      this.trackEventMetric(eventName, properties);
      return result;
    }
    
    // Validate required properties
    if (rule.requiredProperties) {
      for (const prop of rule.requiredProperties) {
        if (!properties || !(prop in properties)) {
          result.errors.push(`Missing required property: ${prop}`);
          result.isValid = false;
        }
      }
    }
    
    // Validate property types
    if (rule.propertyTypes && properties) {
      for (const [prop, expectedType] of Object.entries(rule.propertyTypes)) {
        if (prop in properties) {
          const actualType = Array.isArray(properties[prop]) ? 'array' : typeof properties[prop];
          if (actualType !== expectedType) {
            result.warnings.push(
              `Property ${prop} has type ${actualType}, expected ${expectedType}`
            );
          }
        }
      }
    }
    
    // Validate property ranges
    if (rule.propertyRanges && properties) {
      for (const [prop, range] of Object.entries(rule.propertyRanges)) {
        if (prop in properties && typeof properties[prop] === 'number') {
          const value = properties[prop];
          if (range.min !== undefined && value < range.min) {
            result.warnings.push(`Property ${prop} (${value}) is below minimum ${range.min}`);
          }
          if (range.max !== undefined && value > range.max) {
            result.warnings.push(`Property ${prop} (${value}) exceeds maximum ${range.max}`);
          }
        }
      }
    }
    
    // Track metrics
    this.trackEventMetric(eventName, properties, !result.isValid);
    
    // Log validation results in debug mode
    if (this.debugMode && (!result.isValid || result.warnings.length > 0)) {
      console.warn(`Analytics Validation for ${eventName}:`, result);
    }
    
    return result;
  }
  
  private isValidEventName(eventName: string): boolean {
    // Event names should be snake_case and not exceed 40 characters
    const pattern = /^[a-z][a-z0-9_]{0,39}$/;
    return pattern.test(eventName);
  }
  
  private trackEventMetric(
    eventName: string,
    properties?: Record<string, any>,
    hasError: boolean = false
  ): void {
    const existing = this.eventMetrics.get(eventName);
    const propertyCount = properties ? Object.keys(properties).length : 0;
    
    if (existing) {
      existing.count++;
      existing.lastFired = Date.now();
      existing.averageProperties = 
        (existing.averageProperties * (existing.count - 1) + propertyCount) / existing.count;
      if (hasError) existing.errors++;
    } else {
      this.eventMetrics.set(eventName, {
        eventName,
        count: 1,
        lastFired: Date.now(),
        averageProperties: propertyCount,
        errors: hasError ? 1 : 0,
      });
    }
  }
  
  // Start monitoring mode
  startMonitoring(): void {
    this.monitoring = true;
    console.log('📊 Analytics monitoring started');
    
    // Set up periodic reporting
    setInterval(() => {
      if (this.monitoring) {
        this.generateReport();
      }
    }, 60000); // Report every minute
  }
  
  stopMonitoring(): void {
    this.monitoring = false;
    console.log('📊 Analytics monitoring stopped');
  }
  
  // Generate analytics health report
  generateReport(): AnalyticsHealthReport {
    const metrics = Array.from(this.eventMetrics.values());
    const totalEvents = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    
    const report: AnalyticsHealthReport = {
      timestamp: Date.now(),
      totalEvents,
      totalErrors,
      errorRate: totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0,
      uniqueEvents: metrics.length,
      topEvents: metrics
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(m => ({
          name: m.eventName,
          count: m.count,
          errorRate: m.count > 0 ? (m.errors / m.count) * 100 : 0,
        })),
      problematicEvents: metrics
        .filter(m => m.errors > 0)
        .map(m => ({
          name: m.eventName,
          errors: m.errors,
          errorRate: (m.errors / m.count) * 100,
        })),
      recommendations: this.generateRecommendations(metrics),
    };
    
    if (this.debugMode) {
      console.log('📊 Analytics Health Report:', report);
    }
    
    // Store report
    this.storeReport(report);
    
    return report;
  }
  
  private generateRecommendations(metrics: EventMetrics[]): string[] {
    const recommendations: string[] = [];
    
    // Check for events with high error rates
    const highErrorEvents = metrics.filter(m => m.count > 10 && (m.errors / m.count) > 0.1);
    if (highErrorEvents.length > 0) {
      recommendations.push(
        `High error rate detected for events: ${highErrorEvents.map(e => e.eventName).join(', ')}`
      );
    }
    
    // Check for events with too many properties
    const overloadedEvents = metrics.filter(m => m.averageProperties > 20);
    if (overloadedEvents.length > 0) {
      recommendations.push(
        `Events with excessive properties: ${overloadedEvents.map(e => e.eventName).join(', ')}`
      );
    }
    
    // Check for unused events (defined but never fired)
    const definedEvents = Array.from(this.validationRules.keys());
    const firedEvents = metrics.map(m => m.eventName);
    const unusedEvents = definedEvents.filter(e => !firedEvents.includes(e));
    if (unusedEvents.length > 0) {
      recommendations.push(
        `Defined but unused events: ${unusedEvents.join(', ')}`
      );
    }
    
    return recommendations;
  }
  
  private async storeReport(report: AnalyticsHealthReport): Promise<void> {
    try {
      const reports = await this.getStoredReports();
      reports.push(report);
      
      // Keep only last 100 reports
      if (reports.length > 100) {
        reports.shift();
      }
      
      await AsyncStorage.setItem('analytics_health_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to store analytics report:', error);
    }
  }
  
  async getStoredReports(): Promise<AnalyticsHealthReport[]> {
    try {
      const stored = await AsyncStorage.getItem('analytics_health_reports');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve analytics reports:', error);
      return [];
    }
  }
  
  // Test analytics implementation
  async runValidationTests(): Promise<TestResults> {
    console.log('🧪 Running analytics validation tests...');
    
    const results: TestResults = {
      passed: [],
      failed: [],
      warnings: [],
    };
    
    // Test 1: Validate all defined events
    for (const [eventName, rule] of this.validationRules.entries()) {
      const mockProperties = this.generateMockProperties(rule);
      const validation = this.validateEvent(eventName, mockProperties);
      
      if (validation.isValid) {
        results.passed.push(`✅ ${eventName} validation passed`);
      } else {
        results.failed.push(`❌ ${eventName}: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        results.warnings.push(`⚠️ ${eventName}: ${validation.warnings.join(', ')}`);
      }
    }
    
    // Test 2: Check for duplicate events
    const recentEvents = await this.getRecentEvents();
    const duplicates = this.findDuplicateEvents(recentEvents);
    if (duplicates.length > 0) {
      results.warnings.push(`⚠️ Duplicate events detected: ${duplicates.join(', ')}`);
    }
    
    // Test 3: Performance check
    const performanceIssues = await this.checkPerformance();
    if (performanceIssues.length > 0) {
      results.warnings.push(...performanceIssues);
    }
    
    console.log('🧪 Validation test results:', results);
    return results;
  }
  
  private generateMockProperties(rule: ValidationRule): Record<string, any> {
    const mock: Record<string, any> = {};
    
    // Add required properties with appropriate types
    for (const prop of rule.requiredProperties) {
      const type = rule.propertyTypes?.[prop] || 'string';
      switch (type) {
        case 'string':
          mock[prop] = 'test_value';
          break;
        case 'number':
          const range = rule.propertyRanges?.[prop];
          mock[prop] = range?.min || 1;
          break;
        case 'array':
          mock[prop] = [];
          break;
        case 'boolean':
          mock[prop] = true;
          break;
        default:
          mock[prop] = null;
      }
    }
    
    return mock;
  }
  
  private async getRecentEvents(): Promise<any[]> {
    // TODO: Implement fetching recent events from analytics service
    return [];
  }
  
  private findDuplicateEvents(events: any[]): string[] {
    const duplicates: string[] = [];
    const seen = new Map<string, number>();
    
    for (const event of events) {
      const key = `${event.name}_${JSON.stringify(event.properties)}`;
      const lastSeen = seen.get(key);
      
      if (lastSeen && Date.now() - lastSeen < 1000) {
        // Same event within 1 second
        duplicates.push(event.name);
      }
      
      seen.set(key, Date.now());
    }
    
    return duplicates;
  }
  
  private async checkPerformance(): Promise<string[]> {
    const issues: string[] = [];
    
    // Check event queue size
    const queue = await AsyncStorage.getItem('analytics_queue');
    if (queue) {
      const events = JSON.parse(queue);
      if (events.length > 100) {
        issues.push(`⚠️ Large event queue: ${events.length} events pending`);
      }
    }
    
    // Check event frequency
    const metrics = Array.from(this.eventMetrics.values());
    const highFrequencyEvents = metrics.filter(m => {
      const timeDiff = Date.now() - m.lastFired;
      const eventsPerSecond = m.count / (timeDiff / 1000);
      return eventsPerSecond > 10; // More than 10 events per second
    });
    
    if (highFrequencyEvents.length > 0) {
      issues.push(
        `⚠️ High frequency events: ${highFrequencyEvents.map(e => e.eventName).join(', ')}`
      );
    }
    
    return issues;
  }
  
  // Export metrics for debugging
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: Array.from(this.eventMetrics.values()),
      rules: Array.from(this.validationRules.values()),
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  // Clear all metrics
  clearMetrics(): void {
    this.eventMetrics.clear();
    console.log('📊 Analytics metrics cleared');
  }
}

// Type definitions
interface AnalyticsHealthReport {
  timestamp: number;
  totalEvents: number;
  totalErrors: number;
  errorRate: number;
  uniqueEvents: number;
  topEvents: Array<{
    name: string;
    count: number;
    errorRate: number;
  }>;
  problematicEvents: Array<{
    name: string;
    errors: number;
    errorRate: number;
  }>;
  recommendations: string[];
}

interface TestResults {
  passed: string[];
  failed: string[];
  warnings: string[];
}

export default AnalyticsValidator.getInstance();