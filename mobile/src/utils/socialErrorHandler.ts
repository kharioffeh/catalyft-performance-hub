/**
 * Error handling utilities for social features
 * Provides centralized error handling, retry logic, and user-friendly messages
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error types
export enum SocialErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',      // Log only
  MEDIUM = 'MEDIUM', // Show toast
  HIGH = 'HIGH',    // Show alert
  CRITICAL = 'CRITICAL', // Show alert and potentially logout
}

// Custom error class for social features
export class SocialError extends Error {
  type: SocialErrorType;
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  technicalDetails?: any;
  timestamp: Date;

  constructor(
    message: string,
    type: SocialErrorType = SocialErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false,
    technicalDetails?: any
  ) {
    super(message);
    this.name = 'SocialError';
    this.type = type;
    this.severity = severity;
    this.retryable = retryable;
    this.userMessage = this.getUserFriendlyMessage(type, message);
    this.technicalDetails = technicalDetails;
    this.timestamp = new Date();
  }

  private getUserFriendlyMessage(type: SocialErrorType, defaultMessage: string): string {
    const messages: { [key in SocialErrorType]: string } = {
      [SocialErrorType.NETWORK]: 'Unable to connect. Please check your internet connection.',
      [SocialErrorType.AUTH]: 'Please sign in to continue.',
      [SocialErrorType.PERMISSION]: 'You don\'t have permission to perform this action.',
      [SocialErrorType.VALIDATION]: 'Please check your input and try again.',
      [SocialErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
      [SocialErrorType.SERVER]: 'Something went wrong on our end. Please try again later.',
      [SocialErrorType.NOT_FOUND]: 'The requested content could not be found.',
      [SocialErrorType.CONFLICT]: 'This action conflicts with existing data.',
      [SocialErrorType.UNKNOWN]: defaultMessage || 'An unexpected error occurred.',
    };

    return messages[type];
  }
}

// Error handler class
export class SocialErrorHandler {
  private static instance: SocialErrorHandler;
  private errorLog: SocialError[] = [];
  private maxLogSize = 100;
  private retryDelays = [1000, 2000, 5000]; // Exponential backoff

  private constructor() {}

  static getInstance(): SocialErrorHandler {
    if (!SocialErrorHandler.instance) {
      SocialErrorHandler.instance = new SocialErrorHandler();
    }
    return SocialErrorHandler.instance;
  }

  // Main error handling method
  async handleError(error: any, context?: string): Promise<void> {
    const socialError = this.parseError(error);
    
    // Log error
    await this.logError(socialError, context);
    
    // Handle based on severity
    switch (socialError.severity) {
      case ErrorSeverity.LOW:
        console.log(`[Social Error] ${context}: ${socialError.message}`);
        break;
      case ErrorSeverity.MEDIUM:
        this.showToast(socialError.userMessage);
        break;
      case ErrorSeverity.HIGH:
        this.showAlert(socialError.userMessage, socialError.retryable);
        break;
      case ErrorSeverity.CRITICAL:
        this.handleCriticalError(socialError);
        break;
    }
  }

  // Parse different error formats
  private parseError(error: any): SocialError {
    // Already a SocialError
    if (error instanceof SocialError) {
      return error;
    }

    // Supabase error
    if (error?.code && error?.message) {
      return this.parseSupabaseError(error);
    }

    // Network error
    if (error?.message?.toLowerCase().includes('network')) {
      return new SocialError(
        error.message,
        SocialErrorType.NETWORK,
        ErrorSeverity.MEDIUM,
        true
      );
    }

    // Generic error
    return new SocialError(
      error?.message || 'Unknown error',
      SocialErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      false,
      error
    );
  }

  // Parse Supabase specific errors
  private parseSupabaseError(error: any): SocialError {
    const errorMap: { [key: string]: { type: SocialErrorType; severity: ErrorSeverity } } = {
      '23505': { type: SocialErrorType.CONFLICT, severity: ErrorSeverity.MEDIUM },
      '23503': { type: SocialErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM },
      '42501': { type: SocialErrorType.PERMISSION, severity: ErrorSeverity.HIGH },
      'PGRST301': { type: SocialErrorType.AUTH, severity: ErrorSeverity.HIGH },
      'PGRST116': { type: SocialErrorType.NOT_FOUND, severity: ErrorSeverity.LOW },
    };

    const errorInfo = errorMap[error.code] || {
      type: SocialErrorType.SERVER,
      severity: ErrorSeverity.MEDIUM,
    };

    return new SocialError(
      error.message,
      errorInfo.type,
      errorInfo.severity,
      errorInfo.type === SocialErrorType.NETWORK,
      error
    );
  }

  // Retry logic with exponential backoff
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const socialError = this.parseError(error);

        if (!socialError.retryable || attempt === maxRetries - 1) {
          throw socialError;
        }

        const delay = this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)];
        console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Log error to storage for debugging
  private async logError(error: SocialError, context?: string): Promise<void> {
    const errorEntry = {
      ...error,
      context,
      timestamp: new Date().toISOString(),
    };

    this.errorLog.push(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Persist to storage for debugging
    try {
      await AsyncStorage.setItem(
        '@social_error_log',
        JSON.stringify(this.errorLog.map(e => ({
          message: e.message,
          type: e.type,
          severity: e.severity,
          timestamp: e.timestamp,
          context,
        })))
      );
    } catch {
      // Silently fail if storage fails
    }
  }

  // Show toast notification (would integrate with toast library)
  private showToast(message: string): void {
    // In production, use a toast library like react-native-toast-message
    console.log(`[Toast] ${message}`);
  }

  // Show alert dialog
  private showAlert(message: string, retryable: boolean): void {
    const buttons = retryable
      ?         [
          { text: 'Cancel', style: 'cancel' as const },
          { text: 'Retry', onPress: () => this.handleRetry() },
        ]
      : [{ text: 'OK' }];

    Alert.alert('Error', message, buttons);
  }

  // Handle critical errors
  private handleCriticalError(error: SocialError): void {
    Alert.alert(
      'Critical Error',
      error.userMessage,
      [
        {
          text: 'OK',
          onPress: () => {
            // In production, might want to logout or restart app
            console.error('[CRITICAL]', error);
          },
        },
      ],
      { cancelable: false }
    );
  }

  // Placeholder for retry logic
  private handleRetry(): void {
    // This would be connected to the actual retry mechanism
    console.log('Retrying last operation...');
  }

  // Get error statistics for monitoring
  getErrorStats(): {
    total: number;
    byType: { [key in SocialErrorType]?: number };
    bySeverity: { [key in ErrorSeverity]?: number };
    recentErrors: SocialError[];
  } {
    const byType: { [key in SocialErrorType]?: number } = {};
    const bySeverity: { [key in ErrorSeverity]?: number } = {};

    this.errorLog.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      recentErrors: this.errorLog.slice(-10),
    };
  }

  // Clear error log
  async clearErrorLog(): Promise<void> {
    this.errorLog = [];
    await AsyncStorage.removeItem('@social_error_log');
  }
}

// Validation error helpers
export const validationErrors = {
  username: (value: string): string | null => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },

  bio: (value: string): string | null => {
    if (value.length > 500) return 'Bio must be less than 500 characters';
    return null;
  },

  postContent: (value: string): string | null => {
    if (value.length > 1000) return 'Post content must be less than 1000 characters';
    return null;
  },

  challengeName: (value: string): string | null => {
    if (!value) return 'Challenge name is required';
    if (value.length < 3) return 'Challenge name must be at least 3 characters';
    if (value.length > 50) return 'Challenge name must be less than 50 characters';
    return null;
  },
};

// Network status monitor
export class NetworkMonitor {
  private static isOnline = true;
  private static listeners: ((online: boolean) => void)[] = [];

  static subscribe(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    this.listeners.forEach(listener => listener(online));
  }

  static getStatus(): boolean {
    return this.isOnline;
  }

  static async waitForConnection(timeout: number = 30000): Promise<void> {
    if (this.isOnline) return;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new SocialError(
          'Connection timeout',
          SocialErrorType.NETWORK,
          ErrorSeverity.HIGH,
          true
        ));
      }, timeout);

      const unsubscribe = this.subscribe((online) => {
        if (online) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        }
      });
    });
  }
}

// Export singleton instance
export const socialErrorHandler = SocialErrorHandler.getInstance();