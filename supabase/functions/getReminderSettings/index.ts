import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow GET method
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's reminder settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reminder_enabled, reminder_frequency_minutes, device_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching reminder settings:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reminder settings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format frequency for display
    const freq = profile.reminder_frequency_minutes || 60;
    let frequencyDisplay;
    if (freq < 60) {
      frequencyDisplay = `${freq} minute${freq !== 1 ? 's' : ''}`;
    } else if (freq === 60) {
      frequencyDisplay = '1 hour';
    } else {
      const hours = Math.floor(freq / 60);
      const mins = freq % 60;
      if (mins === 0) {
        frequencyDisplay = `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        frequencyDisplay = `${hours}h ${mins}m`;
      }
    }

    return new Response(
      JSON.stringify({ 
        reminder_enabled: profile.reminder_enabled ?? true,
        reminder_frequency_minutes: profile.reminder_frequency_minutes ?? 60,
        frequency_display: frequencyDisplay,
        device_token_configured: !!profile.device_token,
        available_frequencies: [
          { value: 5, label: '5 minutes' },
          { value: 10, label: '10 minutes' },
          { value: 15, label: '15 minutes' },
          { value: 30, label: '30 minutes' },
          { value: 45, label: '45 minutes' },
          { value: 60, label: '1 hour' },
          { value: 90, label: '1.5 hours' },
          { value: 120, label: '2 hours' },
          { value: 180, label: '3 hours' },
          { value: 240, label: '4 hours' },
          { value: 360, label: '6 hours' },
          { value: 480, label: '8 hours' },
          { value: 720, label: '12 hours' },
          { value: 1440, label: '24 hours' }
        ]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in getReminderSettings:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});