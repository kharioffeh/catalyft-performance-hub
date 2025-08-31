import { Platform, InteractionManager } from 'react-native';
import performance from '@react-native-firebase/perf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedAnalyticsService from './analytics.enhanced';
import crashlytics from '@react-native-firebase/crashlytics';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ScreenMetrics {
  screenName: string;
  renderTime: number;
  interactionTime: number;
  componentCount: number;
  memoryUsage?: number;
}

interface NetworkMetrics {
  url: string;
  method: string;
  statusCode: number;
  duration: number;
  requestSize: number;
  responseSize: number;
  error?: string;
}

interface AppMetrics {
  sessionId: string;
  startTime: number;
  screenMetrics: ScreenMetrics[];
  networkMetrics: NetworkMetrics[];
  customMetrics: PerformanceMetric[];
  jsFrameRate: number[];
  uiFrameRate: number[];
  memoryWarnings: number;
  crashes: number;
}

// Performance thresholds
const THRESHOLDS = {
  SCREEN_RENDER: 1000, // 1 second
  INTERACTION_READY: 3000, // 3 seconds
  NETWORK_REQUEST: 5000, // 5 seconds
  JS_FRAME_RATE: 50, // 50 FPS minimum
  UI_FRAME_RATE: 55, // 55 FPS minimum
  MEMORY_WARNING: 100, // MB
};

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private traces: Map<string, any> = new Map();
  private metrics: Map<string, PerformanceMetric> = new Map();
  private appMetrics: AppMetrics;
  private monitoring: boolean = false;
  private frameRateInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.appMetrics = this.initializeAppMetrics();
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  private initializeAppMetrics(): AppMetrics {
    return {
      sessionId: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      screenMetrics: [],
      networkMetrics: [],
      customMetrics: [],
      jsFrameRate: [],
      uiFrameRate: [],
      memoryWarnings: 0,
      crashes: 0,
    };
  }
  
  async initialize(): Promise<void> {
    // Enable Firebase Performance Monitoring
    await performance().setPerformanceCollectionEnabled(true);
    
    // Start monitoring
    this.startMonitoring();
    
    console.log('Performance monitoring initialized');
  }
  
  startMonitoring(): void {
    if (this.monitoring) return;
    
    this.monitoring = true;
    
    // Monitor frame rates
    this.startFrameRateMonitoring();
    
    // Monitor memory
    this.startMemoryMonitoring();
    
    // Set up periodic reporting
    setInterval(() => {
      this.reportMetrics();
    }, 60000); // Report every minute
  }
  
  stopMonitoring(): void {
    this.monitoring = false;
    
    if (this.frameRateInterval) {
      clearInterval(this.frameRateInterval);
      this.frameRateInterval = null;
    }
  }
  
  // Screen performance tracking
  async trackScreenRender(screenName: string): Promise<void> {
    const startTime = Date.now();
    
    // Create Firebase trace
    const trace = await performance().startTrace(`screen_render_${screenName}`);
    trace.putAttribute('screen_name', screenName);
    
    // Wait for interaction
    InteractionManager.runAfterInteractions(async () => {
      const renderTime = Date.now() - startTime;
      
      // Stop trace
      await trace.stop();
      
      // Record metrics
      const metrics: ScreenMetrics = {
        screenName,
        renderTime,
        interactionTime: renderTime,
        componentCount: 0, // TODO: Count rendered components
      };
      
      this.appMetrics.screenMetrics.push(metrics);
      
      // Check threshold
      if (renderTime > THRESHOLDS.SCREEN_RENDER) {
        this.reportSlowScreen(screenName, renderTime);
      }
      
      // Track in analytics
      EnhancedAnalyticsService.track('screen_performance', {
        screen_name: screenName,
        render_time: renderTime,
        is_slow: renderTime > THRESHOLDS.SCREEN_RENDER,
      });
    });
  }
  
  // Network performance tracking
  async trackNetworkRequest(
    url: string,
    method: string,
    requestSize: number = 0
  ): Promise<(statusCode: number, responseSize: number, error?: Error) => void> {
    const startTime = Date.now();
    const traceName = `network_${method}_${this.sanitizeUrl(url)}`;
    
    // Start Firebase trace
    const trace = await performance().startTrace(`network_${method}_${this.sanitizeUrl(url)}`);
    trace.putAttribute('method', method);
    
    // Return callback to stop tracking
    return async (statusCode: number, responseSize: number, error?: Error) => {
      const duration = Date.now() - startTime;
      
      // Set HTTP metric attributes
      trace.putAttribute('http_response_code', statusCode.toString());
      trace.putAttribute('request_payload_size', requestSize.toString());
      trace.putAttribute('response_payload_size', responseSize.toString());
      
      if (error) {
        trace.putAttribute('error', error.message);
      }
      
      // Stop trace
      await trace.stop();
      
      // Record metrics
      const metrics: NetworkMetrics = {
        url: this.sanitizeUrl(url),
        method,
        statusCode,
        duration,
        requestSize,
        responseSize,
        error: error?.message,
      };
      
      this.appMetrics.networkMetrics.push(metrics);
      
      // Check threshold
      if (duration > THRESHOLDS.NETWORK_REQUEST) {
        this.reportSlowNetwork(url, duration);
      }
      
      // Track in analytics
      EnhancedAnalyticsService.track('network_performance', {
        url: this.sanitizeUrl(url),
        method,
        status_code: statusCode,
        duration,
        is_slow: duration > THRESHOLDS.NETWORK_REQUEST,
        has_error: !!error,
      });
    };
  }
  
  // Custom performance tracking
  startTrace(name: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };
    
    this.metrics.set(name, metric);
    
    // Start Firebase trace
    performance().startTrace(name).then(trace => {
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          trace.putAttribute(key, String(value));
        });
      }
      this.traces.set(name, trace);
    });
  }
  
  async endTrace(name: string, additionalMetadata?: Record<string, any>): Promise<void> {
    const metric = this.metrics.get(name);
    const trace = this.traces.get(name);
    
    if (!metric) {
      console.warn(`No trace found for: ${name}`);
      return;
    }
    
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }
    
    // Stop Firebase trace
    if (trace) {
      if (additionalMetadata) {
        Object.entries(additionalMetadata).forEach(([key, value]) => {
          trace.putAttribute(key, String(value));
        });
      }
      await trace.stop();
      this.traces.delete(name);
    }
    
    // Record metric
    this.appMetrics.customMetrics.push(metric);
    this.metrics.delete(name);
    
    // Track in analytics
    EnhancedAnalyticsService.track('custom_performance_metric', {
      metric_name: name,
      duration: metric.duration,
      ...metric.metadata,
    });
  }
  
  // Frame rate monitoring
  private startFrameRateMonitoring(): void {
    if (this.frameRateInterval) return;
    
    this.frameRateInterval = setInterval(() => {
      // TODO: Implement actual frame rate measurement
      // For now, using mock data
      const jsFrameRate = 55 + Math.random() * 10;
      const uiFrameRate = 58 + Math.random() * 5;
      
      this.appMetrics.jsFrameRate.push(jsFrameRate);
      this.appMetrics.uiFrameRate.push(uiFrameRate);
      
      // Check thresholds
      if (jsFrameRate < THRESHOLDS.JS_FRAME_RATE) {
        this.reportLowFrameRate('JS', jsFrameRate);
      }
      
      if (uiFrameRate < THRESHOLDS.UI_FRAME_RATE) {
        this.reportLowFrameRate('UI', uiFrameRate);
      }
    }, 1000); // Check every second
  }
  
  // Memory monitoring
  private startMemoryMonitoring(): void {
    // TODO: Implement actual memory monitoring
    // React Native doesn't provide direct memory APIs
    
    // Track memory warnings
    if (Platform.OS === 'ios') {
      // iOS memory warning listener
      // TODO: Add native module for memory warnings
    }
  }
  
  // Report slow screen render
  private reportSlowScreen(screenName: string, renderTime: number): void {
    console.warn(`Slow screen render: ${screenName} took ${renderTime}ms`);
    
    crashlytics().log(`Slow screen: ${screenName} - ${renderTime}ms`);
    
    EnhancedAnalyticsService.track('performance_issue', {
      type: 'slow_screen',
      screen_name: screenName,
      render_time: renderTime,
      threshold: THRESHOLDS.SCREEN_RENDER,
    });
  }
  
  // Report slow network request
  private reportSlowNetwork(url: string, duration: number): void {
    console.warn(`Slow network request: ${url} took ${duration}ms`);
    
    crashlytics().log(`Slow network: ${this.sanitizeUrl(url)} - ${duration}ms`);
    
    EnhancedAnalyticsService.track('performance_issue', {
      type: 'slow_network',
      url: this.sanitizeUrl(url),
      duration,
      threshold: THRESHOLDS.NETWORK_REQUEST,
    });
  }
  
  // Report low frame rate
  private reportLowFrameRate(type: 'JS' | 'UI', frameRate: number): void {
    console.warn(`Low ${type} frame rate: ${frameRate.toFixed(1)} FPS`);
    
    crashlytics().log(`Low ${type} frame rate: ${frameRate.toFixed(1)} FPS`);
    
    EnhancedAnalyticsService.track('performance_issue', {
      type: 'low_frame_rate',
      frame_type: type,
      frame_rate: frameRate,
      threshold: type === 'JS' ? THRESHOLDS.JS_FRAME_RATE : THRESHOLDS.UI_FRAME_RATE,
    });
  }
  
  // Report metrics summary
  private async reportMetrics(): Promise<void> {
    if (!this.monitoring) return;
    
    const summary = this.generateSummary();
    
    // Track summary
    EnhancedAnalyticsService.track('performance_summary', summary);
    
    // Store for later analysis
    await this.storeMetrics(summary);
    
    // Reset some metrics
    this.appMetrics.screenMetrics = [];
    this.appMetrics.networkMetrics = [];
    this.appMetrics.customMetrics = [];
  }
  
  // Generate performance summary
  private generateSummary(): Record<string, any> {
    const avgScreenRender = this.calculateAverage(
      this.appMetrics.screenMetrics.map(m => m.renderTime)
    );
    
    const avgNetworkDuration = this.calculateAverage(
      this.appMetrics.networkMetrics.map(m => m.duration)
    );
    
    const avgJsFrameRate = this.calculateAverage(this.appMetrics.jsFrameRate);
    const avgUiFrameRate = this.calculateAverage(this.appMetrics.uiFrameRate);
    
    return {
      session_id: this.appMetrics.sessionId,
      duration: Date.now() - this.appMetrics.startTime,
      screens_rendered: this.appMetrics.screenMetrics.length,
      avg_screen_render: avgScreenRender,
      slow_screens: this.appMetrics.screenMetrics.filter(
        m => m.renderTime > THRESHOLDS.SCREEN_RENDER
      ).length,
      network_requests: this.appMetrics.networkMetrics.length,
      avg_network_duration: avgNetworkDuration,
      slow_requests: this.appMetrics.networkMetrics.filter(
        m => m.duration > THRESHOLDS.NETWORK_REQUEST
      ).length,
      network_errors: this.appMetrics.networkMetrics.filter(m => m.error).length,
      avg_js_frame_rate: avgJsFrameRate,
      avg_ui_frame_rate: avgUiFrameRate,
      memory_warnings: this.appMetrics.memoryWarnings,
      custom_metrics: this.appMetrics.customMetrics.length,
    };
  }
  
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  private sanitizeUrl(url: string): string {
    // Remove sensitive data from URL
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url.split('?')[0]; // Remove query params
    }
  }
  
  private async storeMetrics(summary: Record<string, any>): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('performance_metrics');
      const metrics = stored ? JSON.parse(stored) : [];
      
      metrics.push({
        ...summary,
        timestamp: Date.now(),
      });
      
      // Keep only last 100 summaries
      if (metrics.length > 100) {
        metrics.shift();
      }
      
      await AsyncStorage.setItem('performance_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }
  }
  
  // Get performance report
  async getPerformanceReport(): Promise<Record<string, any>> {
    const stored = await AsyncStorage.getItem('performance_metrics');
    const metrics = stored ? JSON.parse(stored) : [];
    
    if (metrics.length === 0) {
      return { message: 'No performance data available' };
    }
    
    // Calculate aggregates
    const report = {
      total_sessions: metrics.length,
      avg_session_duration: this.calculateAverage(metrics.map((m: any) => m.duration)),
      total_screens: metrics.reduce((sum: number, m: any) => sum + m.screens_rendered, 0),
      avg_screen_render: this.calculateAverage(metrics.map((m: any) => m.avg_screen_render)),
      total_network_requests: metrics.reduce((sum: number, m: any) => sum + m.network_requests, 0),
      avg_network_duration: this.calculateAverage(metrics.map((m: any) => m.avg_network_duration)),
      avg_js_frame_rate: this.calculateAverage(metrics.map((m: any) => m.avg_js_frame_rate)),
      avg_ui_frame_rate: this.calculateAverage(metrics.map((m: any) => m.avg_ui_frame_rate)),
      total_memory_warnings: metrics.reduce((sum: number, m: any) => sum + m.memory_warnings, 0),
      performance_score: this.calculatePerformanceScore(metrics),
    };
    
    return report;
  }
  
  private calculatePerformanceScore(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    
    const latestMetrics = metrics[metrics.length - 1];
    
    // Calculate score based on various factors (0-100)
    let score = 100;
    
    // Deduct for slow screens
    if (latestMetrics.avg_screen_render > THRESHOLDS.SCREEN_RENDER) {
      score -= 20;
    }
    
    // Deduct for slow network
    if (latestMetrics.avg_network_duration > THRESHOLDS.NETWORK_REQUEST) {
      score -= 15;
    }
    
    // Deduct for low frame rates
    if (latestMetrics.avg_js_frame_rate < THRESHOLDS.JS_FRAME_RATE) {
      score -= 25;
    }
    
    if (latestMetrics.avg_ui_frame_rate < THRESHOLDS.UI_FRAME_RATE) {
      score -= 20;
    }
    
    // Deduct for memory warnings
    if (latestMetrics.memory_warnings > 0) {
      score -= Math.min(20, latestMetrics.memory_warnings * 5);
    }
    
    return Math.max(0, score);
  }
  
  // Clear all metrics
  async clearMetrics(): Promise<void> {
    this.appMetrics = this.initializeAppMetrics();
    await AsyncStorage.removeItem('performance_metrics');
    console.log('Performance metrics cleared');
  }
}

export default PerformanceMonitor.getInstance();