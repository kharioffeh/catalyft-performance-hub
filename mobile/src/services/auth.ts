import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';
import { Platform } from 'react-native';

// Type definitions for Supabase
export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

// Create Supabase client with custom storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth service class
class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.select({
            ios: 'catalyft://auth',
            android: 'catalyft://auth',
            default: 'catalyft://auth',
          }),
          skipBrowserRedirect: Platform.OS === 'ios' || Platform.OS === 'android',
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Sign in with Apple (iOS only)
  async signInWithApple() {
    if (Platform.OS !== 'ios') {
      return { 
        data: null, 
        error: { message: 'Apple Sign In is only available on iOS' } as AuthError 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'catalyft://auth',
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any additional stored data
      await AsyncStorage.multiRemove([
        'biometric_enabled',
        'last_activity',
        'user_preferences',
      ]);
      
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: Platform.select({
          ios: 'catalyft://reset-password',
          android: 'catalyft://reset-password',
          default: 'catalyft://reset-password',
        }),
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Update user profile
  async updateProfile(updates: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Upload avatar
  async uploadAvatar(userId: string, file: any) {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: fileName,
        type: file.type || `image/${fileExt}`,
      } as any);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { data: { url: urlData.publicUrl }, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  }

  // Set up auth state listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Check if email is already registered
  async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned means email doesn't exist
        return { exists: false, error: null };
      }

      if (error) throw error;
      return { exists: !!data, error: null };
    } catch (error) {
      return { exists: false, error: error as AuthError };
    }
  }

  // Store biometric preference
  async setBiometricEnabled(enabled: boolean) {
    try {
      await AsyncStorage.setItem('biometric_enabled', JSON.stringify(enabled));
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Get biometric preference
  async getBiometricEnabled() {
    try {
      const value = await AsyncStorage.getItem('biometric_enabled');
      return { enabled: value ? JSON.parse(value) : false, error: null };
    } catch (error) {
      return { enabled: false, error: error as AuthError };
    }
  }

  // Update last activity timestamp
  async updateLastActivity() {
    try {
      await AsyncStorage.setItem('last_activity', Date.now().toString());
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Check for inactivity timeout (30 minutes)
  async checkInactivityTimeout() {
    try {
      const lastActivity = await AsyncStorage.getItem('last_activity');
      if (!lastActivity) return { shouldLogout: false, error: null };

      const timeDiff = Date.now() - parseInt(lastActivity, 10);
      const thirtyMinutes = 30 * 60 * 1000;

      return { shouldLogout: timeDiff > thirtyMinutes, error: null };
    } catch (error) {
      return { shouldLogout: false, error: error as AuthError };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export auth state helper
export const getAuthState = async () => {
  const { data: session } = await authService.getSession();
  return {
    isAuthenticated: !!session?.session,
    user: session?.session?.user || null,
    session: session?.session || null,
  };
};