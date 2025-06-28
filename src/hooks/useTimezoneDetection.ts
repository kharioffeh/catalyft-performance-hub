
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTimezoneDetection = () => {
  const { profile } = useAuth();

  useEffect(() => {
    const detectAndUpdateTimezone = async () => {
      if (!profile?.id) return;

      // Skip if timezone is already set
      if (profile.timezone) return;

      try {
        // Get browser timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (detectedTimezone) {
          console.log('Detected timezone:', detectedTimezone);
          
          // Update user's timezone in database
          const { error } = await supabase
            .from('profiles')
            .update({ timezone: detectedTimezone })
            .eq('id', profile.id);

          if (error) {
            console.error('Error updating timezone:', error);
          } else {
            console.log('Timezone updated successfully');
          }
        }
      } catch (error) {
        console.error('Error detecting timezone:', error);
      }
    };

    detectAndUpdateTimezone();
  }, [profile]);

  return {
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  };
};
