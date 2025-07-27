import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'coach' | 'athlete' | 'solo'
  created_at: string
  updated_at: string
  weekly_summary_opt_in?: boolean
  has_completed_onboarding?: boolean
}

interface AuthContextType {
  session: Session | null | undefined
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔐 AuthProvider component mounting...');
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Defer profile fetching to avoid blocking auth state updates
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then((profileData) => {
              setProfile(profileData)
              setLoading(false)
            })
          }, 0)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    // THEN check for existing session
    console.log('🔐 Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check result:', session ? 'Found session' : 'No session');
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          setProfile(profileData)
          setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  }

  console.log('🔐 AuthProvider rendering, loading:', loading, 'user:', user?.email);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
