/**
 * Google Fit Service for Android/Web Integration
 * 
 * Handles Google Fit OAuth authentication, permissions, and data syncing
 * for activity tracking on Android devices and web browsers.
 * 
 * Dependencies: @react-native-google-signin/google-signin (for React Native)
 */

import { supabase } from '@/integrations/supabase/client';
import { Platform, Linking } from 'react-native';

// Real React Native imports (commented for web compatibility)
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface GoogleFitConnection {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
  connected_at: string;
  last_sync_at?: string;
}

interface GoogleFitDailyActivity {
  activity_date: string;
  calories_burned: number;
  steps: number;
  distance_meters: number;
  active_minutes: number;
}

interface GoogleFitWorkout {
  session_id: string;
  workout_name: string;
  workout_type: string;
  workout_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  calories_burned: number;
  data_source: string;
}

interface GoogleFitPermissionStatus {
  fitness_activity_read: boolean;
  fitness_body_read: boolean;
  fitness_location_read: boolean;
  fitness_nutrition_read: boolean;
}

class GoogleFitService {
  private static instance: GoogleFitService;
  private isInitialized = false;
  private hasPermissions = false;

  private constructor() {}

  static getInstance(): GoogleFitService {
    if (!GoogleFitService.instance) {
      GoogleFitService.instance = new GoogleFitService();
    }
    return GoogleFitService.instance;
  }

  /**
   * Initialize Google Fit service
   */
  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // In a real React Native app, configure Google Sign-In:
        /*
        GoogleSignin.configure({
          webClientId: '576186375678-qji87agvkua2m798eof25q2aig3c41ou.apps.googleusercontent.com',
          offlineAccess: true,
          hostedDomain: '',
          forceCodeForRefreshToken: true,
          accountName: '',
          iosClientId: '', // Not needed for Android
          googleServicePlistPath: '', // Not needed for Android
        });
        */
        
        this.isInitialized = true;
        return true;
      } else if (Platform.OS === 'web') {
        // Web implementation uses OAuth redirect flow
        this.isInitialized = true;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Google Fit initialization error:', error);
      return false;
    }
  }

  /**
   * Request Google Fit permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get OAuth URL from backend
      const { data, error } = await supabase.functions.invoke('google-fit-oauth', {
        body: { user_id: user.id }
      });

      if (error) {
        throw new Error(`OAuth URL generation failed: ${error.message}`);
      }

      const authUrl = data.authUrl;

      if (Platform.OS === 'android') {
        // For React Native, open OAuth in external browser
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          await Linking.openURL(authUrl);
          
          // In a real app, you'd set up deep link handling to catch the redirect
          // For now, return true and expect user to complete auth manually
          return true;
        } else {
          throw new Error('Cannot open OAuth URL');
        }
      } else if (Platform.OS === 'web') {
        // For web, open popup or redirect
        if (typeof window !== 'undefined') {
          const popup = window.open(
            authUrl,
            'google_fit_auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
          );

          // Listen for popup completion
          return new Promise((resolve) => {
            const messageHandler = (event: MessageEvent) => {
              if (event.data.type === 'google_fit_auth') {
                window.removeEventListener('message', messageHandler);
                popup?.close();
                resolve(event.data.success);
              }
            };

            window.addEventListener('message', messageHandler);

            // Fallback: check if popup was closed manually
            const checkClosed = setInterval(() => {
              if (popup?.closed) {
                clearInterval(checkClosed);
                window.removeEventListener('message', messageHandler);
                resolve(false);
              }
            }, 1000);
          });
        }
      }

      return false;
    } catch (error) {
      console.error('Google Fit permission request error:', error);
      return false;
    }
  }

  /**
   * Check if user has granted necessary permissions
   */
  async getPermissionStatus(): Promise<GoogleFitPermissionStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          fitness_activity_read: false,
          fitness_body_read: false,
          fitness_location_read: false,
          fitness_nutrition_read: false,
        };
      }

      // Check if user has a Google Fit connection
      const { data: connection, error } = await supabase
        .from('google_fit_connections')
        .select('scope, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error || !connection) {
        return {
          fitness_activity_read: false,
          fitness_body_read: false,
          fitness_location_read: false,
          fitness_nutrition_read: false,
        };
      }

      // Check if token is still valid
      const now = new Date();
      const expiresAt = new Date(connection.expires_at);
      
      if (now >= expiresAt) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
      }

      // Parse granted scopes
      const scopes = connection.scope.split(' ');
      
      return {
        fitness_activity_read: scopes.includes('https://www.googleapis.com/auth/fitness.activity.read'),
        fitness_body_read: scopes.includes('https://www.googleapis.com/auth/fitness.body.read'),
        fitness_location_read: scopes.includes('https://www.googleapis.com/auth/fitness.location.read'),
        fitness_nutrition_read: scopes.includes('https://www.googleapis.com/auth/fitness.nutrition.read'),
      };
    } catch (error) {
      console.error('Error checking Google Fit permissions:', error);
      return {
        fitness_activity_read: false,
        fitness_body_read: false,
        fitness_location_read: false,
        fitness_nutrition_read: false,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.functions.invoke('google-fit-oauth', {
        body: {
          action: 'refresh_token',
          user_id: user.id
        }
      });

      if (error || !data.success) {
        console.error('Token refresh failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Sync Google Fit data with backend
   */
  async syncWithBackend(days: number = 7): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }


      const { data, error } = await supabase.functions.invoke('sync-google-fit-data', {
        body: {
          user_id: user.id,
          days: days
        }
      });

      if (error) {
        throw new Error(`Sync failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Google Fit sync error:', error);
      return false;
    }
  }

  /**
   * Read daily activity data from local database
   */
  async readDailyActivity(days: number = 7): Promise<GoogleFitDailyActivity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('google_fit_daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      if (error) {
        console.error('Error reading Google Fit daily activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error reading Google Fit daily activity:', error);
      return [];
    }
  }

  /**
   * Read workout data from local database
   */
  async readWorkouts(days: number = 7): Promise<GoogleFitWorkout[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('google_fit_workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error reading Google Fit workouts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error reading Google Fit workouts:', error);
      return [];
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{
    isConnected: boolean;
    lastSync?: string;
    connection?: GoogleFitConnection;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { isConnected: false };
      }

      const { data: connection, error } = await supabase
        .from('google_fit_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !connection) {
        return { isConnected: false };
      }

      // Check if token is still valid
      const now = new Date();
      const expiresAt = new Date(connection.expires_at);
      
      return {
        isConnected: now < expiresAt,
        lastSync: connection.last_sync_at,
        connection: connection
      };
    } catch (error) {
      console.error('Error getting Google Fit connection status:', error);
      return { isConnected: false };
    }
  }

  /**
   * Disconnect Google Fit
   */
  async disconnect(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.functions.invoke('google-fit-oauth', {
        body: {
          action: 'disconnect',
          user_id: user.id
        }
      });

      if (error || !data.success) {
        console.error('Disconnect failed:', error);
        return false;
      }

      this.hasPermissions = false;
      return true;
    } catch (error) {
      console.error('Google Fit disconnect error:', error);
      return false;
    }
  }

  /**
   * Setup background sync (Android only)
   */
  async setupBackgroundSync(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // In a real React Native app, you'd set up background tasks:
      /*
      const BackgroundJob = require('react-native-background-job');
      
      BackgroundJob.register({
        jobKey: 'google-fit-sync',
        period: 15000, // 15 minutes
      });
      
      BackgroundJob.start({
        jobKey: 'google-fit-sync',
        notificationTitle: 'Syncing fitness data',
        notificationText: 'Keeping your Google Fit data up to date',
      });
      
      BackgroundJob.setJobExecutionHandler((jobKey) => {
        if (jobKey === 'google-fit-sync') {
          this.syncWithBackend(1).finally(() => {
            BackgroundJob.stop({ jobKey });
          });
        }
      });
      */

      return true;
    } catch (error) {
      console.error('Failed to setup Google Fit background sync:', error);
      return false;
    }
  }

  /**
   * Manual trigger for background sync
   */
  async triggerBackgroundSync(): Promise<boolean> {
    try {
      return await this.syncWithBackend(2); // Sync last 2 days
    } catch (error) {
      console.error('Manual Google Fit background sync error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleFitService = GoogleFitService.getInstance();

// Export types
export type {
  GoogleFitConnection,
  GoogleFitDailyActivity,
  GoogleFitWorkout,
  GoogleFitPermissionStatus
};