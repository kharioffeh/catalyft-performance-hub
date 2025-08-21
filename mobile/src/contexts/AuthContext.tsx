import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authService, User, Session, AuthError } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from '../utils/biometrics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  signInWithApple: () => Promise<{ success: boolean; error?: AuthError }>;
  signInWithBiometric: () => Promise<{ success: boolean; error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: AuthError }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: AuthError }>;
  uploadAvatar: (file: any) => Promise<{ success: boolean; url?: string; error?: AuthError }>;
  enableBiometric: () => Promise<{ success: boolean; error?: string }>;
  disableBiometric: () => Promise<void>;
  checkInactivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const rnBiometrics = new ReactNativeBiometrics();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    setupAuthListener();
    checkBiometricPreference();
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  // Set up inactivity timer when user is authenticated
  useEffect(() => {
    if (user) {
      resetInactivityTimer();
    } else {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
    }
  }, [user]);

  const initializeAuth = async () => {
    try {
      const { data } = await authService.getSession();
      if (data?.session) {
        setSession(data.session as Session);
        setUser(data.session.user as User);
        await authService.updateLastActivity();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAuthListener = () => {
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (session) {
        setSession(session);
        setUser(session.user as User);
        await authService.updateLastActivity();
      } else {
        setSession(null);
        setUser(null);
      }

      if (event === 'SIGNED_OUT') {
        // Clear any stored data
        await AsyncStorage.multiRemove(['biometric_credentials', 'last_activity']);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  };

  const checkBiometricPreference = async () => {
    const { enabled } = await authService.getBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    const timer = setTimeout(async () => {
      await checkInactivity();
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    setInactivityTimer(timer);
    authService.updateLastActivity();
  };

  const checkInactivity = async () => {
    const { shouldLogout } = await authService.checkInactivityTimeout();
    
    if (shouldLogout && user) {
      Alert.alert(
        'Session Expired',
        'You have been logged out due to inactivity.',
        [{ text: 'OK', onPress: () => signOut() }]
      );
    } else if (user) {
      resetInactivityTimer();
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.signUp(email, password, fullName);
      
      if (error) {
        return { success: false, error };
      }

      if (data?.user && !data.session) {
        // Email confirmation required
        Alert.alert(
          'Confirm Your Email',
          'Please check your email to confirm your account before signing in.',
          [{ text: 'OK' }]
        );
      }

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        return { success: false, error };
      }

      resetInactivityTimer();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        return { success: false, error };
      }

      resetInactivityTimer();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.signInWithApple();
      
      if (error) {
        return { success: false, error };
      }

      resetInactivityTimer();
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithBiometric = async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      
      if (!available) {
        return { 
          success: false, 
          error: { message: 'Biometric authentication not available' } as AuthError 
        };
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to sign in',
        cancelButtonText: 'Cancel',
      });

      if (!success) {
        return { 
          success: false, 
          error: { message: 'Biometric authentication failed' } as AuthError 
        };
      }

      // Retrieve stored credentials
      const credentials = await AsyncStorage.getItem('biometric_credentials');
      if (!credentials) {
        return { 
          success: false, 
          error: { message: 'No stored credentials found' } as AuthError 
        };
      }

      const { email, password } = JSON.parse(credentials);
      return signIn(email, password);
    } catch (error) {
      return { 
        success: false, 
        error: { message: 'Biometric authentication error' } as AuthError 
      };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        setInactivityTimer(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        return { success: false, error };
      }

      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      
      if (error) {
        return { success: false, error };
      }

      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await authService.updateProfile(updates);
      
      if (error) {
        return { success: false, error };
      }

      if (data?.user) {
        setUser(data.user as User);
      }

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: any) => {
    if (!user) {
      return { 
        success: false, 
        error: { message: 'User not authenticated' } as AuthError 
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await authService.uploadAvatar(user.id, file);
      
      if (error) {
        return { success: false, error };
      }

      if (data?.url) {
        await updateProfile({ avatar_url: data.url });
        return { success: true, url: data.url };
      }

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const enableBiometric = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      if (!available) {
        return { 
          success: false, 
          error: 'Biometric authentication not available on this device' 
        };
      }

      // Prompt for biometric authentication
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: `Enable ${biometryType} for quick sign in`,
        cancelButtonText: 'Cancel',
      });

      if (!success) {
        return { 
          success: false, 
          error: 'Biometric authentication cancelled' 
        };
      }

      // Store biometric preference
      await authService.setBiometricEnabled(true);
      setBiometricEnabled(true);

      Alert.alert(
        'Biometric Authentication Enabled',
        `You can now use ${biometryType} to sign in quickly.`,
        [{ text: 'OK' }]
      );

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to enable biometric authentication' 
      };
    }
  };

  const disableBiometric = async () => {
    await authService.setBiometricEnabled(false);
    setBiometricEnabled(false);
    await AsyncStorage.removeItem('biometric_credentials');
    
    Alert.alert(
      'Biometric Authentication Disabled',
      'You will need to use your email and password to sign in.',
      [{ text: 'OK' }]
    );
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    biometricEnabled,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signInWithBiometric,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    enableBiometric,
    disableBiometric,
    checkInactivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};