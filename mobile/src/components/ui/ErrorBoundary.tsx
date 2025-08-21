/**
 * Catalyft Fitness App - Error Boundary Component
 * Catch and handle errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { theme } from '../../theme';
import EmptyState from './EmptyState';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
          showDetailsOption={this.props.showDetails !== false}
        />
      );
    }

    return this.props.children;
  }
}

// Fallback component
interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  showDetailsOption: boolean;
}

const ErrorBoundaryFallback: React.FC<FallbackProps> = ({
  error,
  errorInfo,
  onReset,
  showDetails,
  onToggleDetails,
  showDetailsOption,
}) => {
  // Note: We can't use hooks directly in the class component,
  // but we can use them in this functional component
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <EmptyState
          type="error"
          title="Oops! Something went wrong"
          message="We're sorry for the inconvenience. Please try restarting the app."
          actionLabel="Try Again"
          onAction={onReset}
          secondaryActionLabel={showDetailsOption ? (showDetails ? "Hide Details" : "Show Details") : undefined}
          onSecondaryAction={showDetailsOption ? onToggleDetails : undefined}
        />
        
        {showDetails && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              Error Details
            </Text>
            
            <View style={styles.errorSection}>
              <Text style={[styles.errorLabel, { color: colors.text }]}>
                Error Message:
              </Text>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                {error.message}
              </Text>
            </View>
            
            {error.stack && (
              <View style={styles.errorSection}>
                <Text style={[styles.errorLabel, { color: colors.text }]}>
                  Stack Trace:
                </Text>
                <ScrollView style={styles.stackTrace} horizontal>
                  <Text style={[styles.stackText, { color: colors.textSecondary }]}>
                    {error.stack}
                  </Text>
                </ScrollView>
              </View>
            )}
            
            {errorInfo?.componentStack && (
              <View style={styles.errorSection}>
                <Text style={[styles.errorLabel, { color: colors.text }]}>
                  Component Stack:
                </Text>
                <ScrollView style={styles.stackTrace} horizontal>
                  <Text style={[styles.stackText, { color: colors.textSecondary }]}>
                    {errorInfo.componentStack}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.s4,
  },
  errorDetails: {
    marginTop: theme.spacing.s6,
    padding: theme.spacing.s4,
    borderRadius: theme.borderRadius.lg,
  },
  errorTitle: {
    ...theme.typography.styles.h5,
    marginBottom: theme.spacing.s4,
  },
  errorSection: {
    marginBottom: theme.spacing.s4,
  },
  errorLabel: {
    ...theme.typography.styles.label,
    marginBottom: theme.spacing.s2,
  },
  errorText: {
    ...theme.typography.styles.bodySmall,
    fontFamily: theme.typography.families.mono,
  },
  stackTrace: {
    maxHeight: 150,
  },
  stackText: {
    ...theme.typography.styles.mono,
    fontSize: 10,
  },
});

export default ErrorBoundary;