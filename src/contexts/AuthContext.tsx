
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'coach' | 'athlete';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('AuthProvider: Current state - user:', !!user, 'profile:', !!profile, 'loading:', loading, 'error:', error);

  const createProfile = async (userId: string, userEmail: string, userMetadata: any): Promise<Profile | null> => {
    try {
      console.log('AuthProvider: Creating new profile for user:', userId);
      
      const newProfileData = {
        id: userId,
        email: userEmail,
        full_name: userMetadata?.full_name || userMetadata?.name || null,
        role: (userMetadata?.role || 'athlete') as 'coach' | 'athlete'
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();
      
      if (createError) {
        console.error('AuthProvider: Error creating profile:', createError);
        throw createError;
      }

      console.log('AuthProvider: Profile created successfully:', newProfile);
      return newProfile as Profile;
    } catch (error) {
      console.error('AuthProvider: Failed to create profile:', error);
      return null;
    }
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('AuthProvider: Fetching profile for user:', userId);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthProvider: Error fetching profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('AuthProvider: Profile not found, attempting to create...');
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const newProfile = await createProfile(
              userId, 
              userData.user.email || '', 
              userData.user.user_metadata || {}
            );
            return newProfile;
          }
        }
        
        setError(`Profile fetch error: ${error.message}`);
        return null;
      }

      console.log('AuthProvider: Profile fetched successfully:', data);
      return data as Profile;
    } catch (error) {
      console.error('AuthProvider: Unexpected error fetching profile:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
      setLoading(false);
    }
  };

  const setupAuth = async (session: Session | null) => {
    console.log('AuthProvider: Setting up auth with session:', !!session);
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      try {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
        
        if (!userProfile) {
          setError('Unable to set up user profile. Please try refreshing the page.');
        }
      } catch (error) {
        console.error('AuthProvider: Error setting up profile:', error);
        setError('Failed to load user profile');
      }
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, !!session);
        
        if (!mounted) return;
        await setupAuth(session);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
          setError(`Session error: ${error.message}`);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: Initial session:', !!session);
        await setupAuth(session);
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthProvider: Error signing out:', error);
      setError(`Sign out error: ${error.message}`);
    } else {
      // Reset all state on successful sign out
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
