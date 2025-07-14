import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow PATCH method
    if (req.method !== 'PATCH') {
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

    // Parse request body
    const body = await req.json();
    const { reminder_enabled, reminder_frequency_minutes } = body;

    // Validate input
    const updateData: any = {};
    
    if (typeof reminder_enabled === 'boolean') {
      updateData.reminder_enabled = reminder_enabled;
    }

    if (typeof reminder_frequency_minutes === 'number') {
      // Validate frequency range (5 minutes to 24 hours)
      if (reminder_frequency_minutes < 5 || reminder_frequency_minutes > 1440) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid reminder frequency. Must be between 5 minutes and 1440 minutes (24 hours)' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      updateData.reminder_frequency_minutes = reminder_frequency_minutes;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid reminder settings provided. Use reminder_enabled (boolean) or reminder_frequency_minutes (number)' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update user's reminder preferences
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('reminder_enabled, reminder_frequency_minutes')
      .single();

    if (updateError) {
      console.error('Error updating reminder settings:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update reminder settings' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format response message
    let message = 'Reminder settings updated successfully';
    if (updateData.reminder_enabled === false) {
      message = 'Workout reminders have been disabled';
    } else if (updateData.reminder_enabled === true) {
      const freq = updatedProfile.reminder_frequency_minutes;
      let timeText;
      if (freq < 60) {
        timeText = `${freq} minute${freq !== 1 ? 's' : ''}`;
      } else if (freq === 60) {
        timeText = '1 hour';
      } else {
        const hours = Math.floor(freq / 60);
        const mins = freq % 60;
        if (mins === 0) {
          timeText = `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
          timeText = `${hours}h ${mins}m`;
        }
      }
      message = `Workout reminders enabled - you'll receive notifications ${timeText} before your sessions`;
    } else if (updateData.reminder_frequency_minutes) {
      const freq = updateData.reminder_frequency_minutes;
      let timeText;
      if (freq < 60) {
        timeText = `${freq} minute${freq !== 1 ? 's' : ''}`;
      } else if (freq === 60) {
        timeText = '1 hour';
      } else {
        const hours = Math.floor(freq / 60);
        const mins = freq % 60;
        if (mins === 0) {
          timeText = `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
          timeText = `${hours}h ${mins}m`;
        }
      }
      message = `Reminder frequency updated to ${timeText} before sessions`;
    }

    return new Response(
      JSON.stringify({ 
        message,
        settings: updatedProfile
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in updateReminderSettings:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});