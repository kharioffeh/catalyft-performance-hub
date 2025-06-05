
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function useSupabaseHash() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (window.location.hash.startsWith('#access_token=')) {
      console.log('Processing hash token...');
      
      (async () => {
        try {
          // Handle hash-fragment tokens
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Hash token error:', error);
            return;
          }
          
          const { session } = data;
          if (!session) {
            console.error('No session from hash token');
            return;
          }

          console.log('Session established from hash:', session.user.email);

          // Fetch profile to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log('Profile data:', profile);

          // New invitee has null role → go to finish-signup page
          if (!profile?.role) {
            console.log('No role found, redirecting to finish-signup');
            return navigate('/finish-signup', { replace: true });
          }

          // Everyone gets redirected to dashboard now
          console.log('Redirecting to dashboard');
          navigate('/dashboard', { replace: true });

        } catch (err) {
          console.error('Hash processing error:', err);
        }
      })();
    }
  }, [navigate]);
}
