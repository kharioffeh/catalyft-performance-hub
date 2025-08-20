/**
 * Production Monitoring Setup
 * Configure error tracking and analytics for production
 */

import * as Sentry from '@sentry/react-native';

interface MonitoringConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
}

class MonitoringService {
  private initialized = false;

  /**
   * Initialize monitoring services for production
   */
  async initialize(config: MonitoringConfig) {
    if (this.initialized || !config.enabled) {
      return;
    }

    try {
      // Initialize Sentry for error tracking
      if (config.dsn) {
        Sentry.init({
          dsn: config.dsn,
          environment: config.environment,
          debug: __DEV__,
          tracesSampleRate: __DEV__ ? 1.0 : 0.1,
          attachStacktrace: true,
          attachScreenshot: true,
          // Ignore certain errors
          ignoreErrors: [
            'Network request failed',
            'AbortError',
            'Non-Error promise rejection captured',
          ],
          beforeSend(event, hint) {
            // Filter out development errors
            if (__DEV__) {
              console.log('Sentry Event:', event, hint);
            }
            return event;
          },
        });

        this.initialized = true;
        console.log('✅ Monitoring initialized for', config.environment);
      }
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    }
  }

  /**
   * Log a custom event
   */
  logEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;

    try {
      Sentry.addBreadcrumb({
        message: eventName,
        category: 'custom',
        data: properties,
        level: 'info',
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Log an error with context
   */
  logError(error: Error, context?: Record<string, any>) {
    console.error('Application Error:', error, context);

    if (!this.initialized) return;

    try {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      });
    } catch (sentryError) {
      console.error('Failed to log error to Sentry:', sentryError);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string; username?: string } | null) {
    if (!this.initialized) return;

    try {
      Sentry.setUser(user);
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  /**
   * Add custom context
   */
  setContext(key: string, context: Record<string, any>) {
    if (!this.initialized) return;

    try {
      Sentry.setContext(key, context);
    } catch (error) {
      console.error('Failed to set context:', error);
    }
  }

  /**
   * Track performance
   */
  startTransaction(name: string, op: string = 'navigation') {
    if (!this.initialized) return null;

    try {
      return (Sentry as any).startTransaction({ name, op });
    } catch (error) {
      console.error('Failed to start transaction:', error);
      return null;
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Helper function to initialize monitoring
export const initializeMonitoring = () => {
  const config: MonitoringConfig = {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    enabled: !__DEV__ && !!process.env.SENTRY_DSN,
  };

  monitoring.initialize(config);
};

// Error boundary component wrapper
export const withErrorBoundary = Sentry.withErrorBoundary;