
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseHash() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (window.location.hash.startsWith('#access_token=')) {
      
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


          // Fetch profile to determine redirect
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();


          // New invitee has null role → go to finish-signup page
          if (!profile?.role) {
            return navigate('/finish-signup', { replace: true });
          }

          // Everyone gets redirected to dashboard now
          navigate('/dashboard', { replace: true });

        } catch (err) {
          console.error('Hash processing error:', err);
        }
      })();
    }
  }, [navigate]);
}
