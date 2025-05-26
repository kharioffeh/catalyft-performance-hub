
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userId,
                  email: userData.user.email || '',
                  full_name: userData.user.user_metadata?.full_name || null,
                  role: userData.user.user_metadata?.role || 'athlete'
                }
              ])
              .select()
              .single();
            
            if (createError) {
              console.error('AuthProvider: Error creating profile:', createError);
              setError(`Profile creation error: ${createError.message}`);
              return null;
            } else {
              console.log('AuthProvider: Profile created successfully:', newProfile);
              return newProfile as Profile;
            }
          }
        } else {
          setError(`Profile fetch error: ${error.message}`);
        }
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

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event, !!session);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
        }
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
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
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
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
