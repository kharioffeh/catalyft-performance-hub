import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { Ionicons } from '@expo/vector-icons';
import EnhancedAnalyticsService from './analytics.enhanced';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Track error count
    const errorKey = `error_count_${new Date().toISOString().split('T')[0]}`;
    const currentCount = await AsyncStorage.getItem(errorKey);
    const newCount = (parseInt(currentCount || '0') + 1).toString();
    await AsyncStorage.setItem(errorKey, newCount);

    // Report to Crashlytics
    crashlytics().recordError(error, error.message);
    crashlytics().log('Error boundary triggered');
    crashlytics().setAttributes({
      error_boundary: 'true',
      component_stack: errorInfo.componentStack || 'unknown',
      error_count: newCount,
    });

    // Track in analytics
    EnhancedAnalyticsService.trackError(error, {
      component_stack: errorInfo.componentStack,
      error_boundary: true,
      error_count: parseInt(newCount),
    }, false);

    // Send error report to backend
    this.sendErrorReport(error, errorInfo);
  }

  private sendErrorReport = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const deviceInfo = {
        platform: 'mobile',
        timestamp: new Date().toISOString(),
        user_id: await AsyncStorage.getItem('user_id'),
        session_id: await AsyncStorage.getItem('session_id'),
      };

      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        ...deviceInfo,
      };

      // TODO: Send to backend API
      console.log('Error report prepared:', errorReport);
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  };

  handleReset = () => {
    // Track recovery attempt
    EnhancedAnalyticsService.track('error_boundary_reset', {
      error_message: this.state.error?.message,
      error_count: this.state.errorCount,
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  handleReportIssue = () => {
    EnhancedAnalyticsService.track('error_boundary_report', {
      error_message: this.state.error?.message,
    });
    
    // TODO: Open feedback modal or navigate to support
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={80} color="#FF6B6B" />
              
              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                We're sorry for the inconvenience. The error has been reported to our team.
              </Text>

              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
                  <Text style={styles.errorMessage}>{this.state.error.message}</Text>
                  <ScrollView style={styles.stackTrace}>
                    <Text style={styles.stackText}>{this.state.error.stack}</Text>
                  </ScrollView>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryButton} onPress={this.handleReset}>
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={this.handleReportIssue}>
                  <Ionicons name="bug-outline" size={20} color="#6C63FF" />
                  <Text style={styles.secondaryButtonText}>Report Issue</Text>
                </TouchableOpacity>
              </View>

              {this.state.errorCount > 2 && (
                <View style={styles.persistentError}>
                  <Text style={styles.persistentErrorText}>
                    This error keeps happening. Please try:
                  </Text>
                  <Text style={styles.suggestion}>• Closing and reopening the app</Text>
                  <Text style={styles.suggestion}>• Checking your internet connection</Text>
                  <Text style={styles.suggestion}>• Updating to the latest version</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
  },
  stackTrace: {
    maxHeight: 150,
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
  },
  stackText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6C63FF',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  persistentError: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    width: '100%',
  },
  persistentErrorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
  },
  suggestion: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    marginTop: 5,
  },
});

export default ErrorBoundary;