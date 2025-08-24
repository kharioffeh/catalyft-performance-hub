import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import AnalyticsService, { EVENTS } from './analytics';

interface CrashlyticsContext {
  userId?: string;
  screen?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class CrashlyticsService {
  private static instance: CrashlyticsService;
  private initialized: boolean = false;
  private context: CrashlyticsContext = {};

  private constructor() {}

  static getInstance(): CrashlyticsService {
    if (!CrashlyticsService.instance) {
      CrashlyticsService.instance = new CrashlyticsService();
    }
    return CrashlyticsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Crashlytics already initialized');
      return;
    }

    try {
      // Enable crashlytics collection
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Set initial attributes
      crashlytics().setAttribute('platform', Platform.OS);
      crashlytics().setAttribute('platform_version', Platform.Version.toString());
      crashlytics().setAttribute('app_version', '1.0.0'); // TODO: Get from app config
      
      this.initialized = true;
      console.log('Crashlytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Crashlytics:', error);
    }
  }

  setUserId(userId: string): void {
    if (!this.initialized) {
      console.warn('Crashlytics not initialized');
      return;
    }

    this.context.userId = userId;
    crashlytics().setUserId(userId);
  }

  setCurrentScreen(screenName: string): void {
    if (!this.initialized) {
      return;
    }

    this.context.screen = screenName;
    crashlytics().setAttribute('current_screen', screenName);
  }

  setCurrentAction(action: string): void {
    if (!this.initialized) {
      return;
    }

    this.context.action = action;
    crashlytics().setAttribute('current_action', action);
  }

  setAttribute(key: string, value: string | number | boolean): void {
    if (!this.initialized) {
      return;
    }

    crashlytics().setAttribute(key, value.toString());
  }

  setAttributes(attributes: Record<string, string | number | boolean>): void {
    if (!this.initialized) {
      return;
    }

    Object.entries(attributes).forEach(([key, value]) => {
      crashlytics().setAttribute(key, value.toString());
    });
  }

  log(message: string): void {
    if (!this.initialized) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    crashlytics().log(logMessage);
    
    if (__DEV__) {
      console.log(`📝 Crashlytics Log: ${logMessage}`);
    }
  }

  recordError(error: Error, fatal: boolean = false): void {
    if (!this.initialized) {
      return;
    }

    // Log error context
    this.log(`Error occurred: ${error.message}`);
    this.log(`Error stack: ${error.stack}`);
    this.log(`Context: ${JSON.stringify(this.context)}`);
    
    // Set error attributes
    crashlytics().setAttribute('error_name', error.name);
    crashlytics().setAttribute('error_message', error.message);
    crashlytics().setAttribute('error_fatal', fatal.toString());
    
    // Record the error
    crashlytics().recordError(error);
    
    // Also track in analytics
    AnalyticsService.trackError(error, {
      fatal,
      ...this.context,
    });

    if (fatal) {
      // For fatal errors, crash the app
      crashlytics().crash();
    }
  }

  recordCustomError(
    name: string,
    message: string,
    stack?: string,
    fatal: boolean = false
  ): void {
    const error = new Error(message);
    error.name = name;
    if (stack) {
      error.stack = stack;
    }
    
    this.recordError(error, fatal);
  }

  // Performance monitoring helpers
  startTrace(traceName: string): void {
    this.log(`Performance trace started: ${traceName}`);
    crashlytics().setAttribute('active_trace', traceName);
  }

  endTrace(traceName: string, metrics?: Record<string, number>): void {
    this.log(`Performance trace ended: ${traceName}`);
    
    if (metrics) {
      Object.entries(metrics).forEach(([key, value]) => {
        crashlytics().setAttribute(`trace_${traceName}_${key}`, value.toString());
      });
    }
  }

  // Network request monitoring
  logNetworkRequest(
    url: string,
    method: string,
    statusCode: number,
    duration: number,
    error?: Error
  ): void {
    const logData = {
      url,
      method,
      status_code: statusCode,
      duration_ms: duration,
      success: !error && statusCode >= 200 && statusCode < 300,
    };

    this.log(`Network request: ${JSON.stringify(logData)}`);
    
    if (error) {
      this.recordError(error, false);
    }
  }

  // User action tracking
  trackUserAction(action: string, metadata?: Record<string, any>): void {
    this.setCurrentAction(action);
    
    const actionData = {
      action,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    
    this.log(`User action: ${JSON.stringify(actionData)}`);
  }

  // Breadcrumb for debugging
  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const breadcrumb = `[${level.toUpperCase()}][${category}] ${message}`;
    this.log(breadcrumb);
  }

  // Test crash (only for development)
  testCrash(): void {
    if (__DEV__) {
      crashlytics().crash();
    }
  }

  // Clear user data (for logout)
  clearUserData(): void {
    if (!this.initialized) {
      return;
    }

    this.context = {};
    crashlytics().setUserId('');
    crashlytics().setAttribute('current_screen', '');
    crashlytics().setAttribute('current_action', '');
  }
}

export default CrashlyticsService.getInstance();