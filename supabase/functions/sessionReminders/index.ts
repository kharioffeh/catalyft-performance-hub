import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendBulkPushNotifications, PushMessage } from '../_shared/push.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting session reminders cron job...');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all unique reminder frequencies from enabled users
    const { data: reminderFreqs, error: freqError } = await supabase
      .from('profiles')
      .select('reminder_frequency_minutes')
      .eq('reminder_enabled', true)
      .not('device_token', 'is', null);

    if (freqError) {
      console.error('Error fetching reminder frequencies:', freqError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reminder preferences' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const uniqueFreqs = [...new Set(reminderFreqs?.map(r => r.reminder_frequency_minutes) || [60])];
    console.log('Checking reminder frequencies (minutes):', uniqueFreqs);

    let allUpcomingSessions = [];

    // Check for sessions at each frequency interval
    for (const freqMinutes of uniqueFreqs) {
      const targetTime = new Date();
      targetTime.setMinutes(targetTime.getMinutes() + freqMinutes);
      
      // Create a 5-minute window around the target time to account for cron timing
      const startTime = new Date(targetTime.getTime() - 2.5 * 60 * 1000);
      const endTime = new Date(targetTime.getTime() + 2.5 * 60 * 1000);

      console.log(`Looking for sessions in ${freqMinutes} minutes (${startTime.toISOString()} to ${endTime.toISOString()})`);

      // Find sessions for this frequency
      const { data: frequencySessions, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          id,
          date_time,
          status,
          program:program_id (
            id,
            title,
            athlete_uuid,
            coach_uuid,
            athlete:athlete_uuid (
              id,
              device_token,
              name,
              email,
              reminder_enabled,
              reminder_frequency_minutes
            )
          )
        `)
        .eq('status', 'scheduled')
        .gte('date_time', startTime.toISOString())
        .lte('date_time', endTime.toISOString());

      if (sessionsError) {
        console.error(`Error fetching sessions for ${freqMinutes}min frequency:`, sessionsError);
        continue;
      }

      // Filter for athletes with matching reminder frequency and enabled reminders
      const filteredSessions = frequencySessions?.filter(session => {
        const athlete = session.program?.athlete;
        return athlete?.reminder_enabled && 
               athlete?.reminder_frequency_minutes === freqMinutes &&
               athlete?.device_token;
      }) || [];

      allUpcomingSessions.push(...filteredSessions);
    }

    const upcomingSessions = allUpcomingSessions;

    console.log(`Found ${upcomingSessions?.length || 0} upcoming sessions`);

    if (!upcomingSessions || upcomingSessions.length === 0) {
      console.log('No sessions found requiring reminders');
      return new Response(
        JSON.stringify({ 
          message: 'No sessions found requiring reminders',
          sent: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare push messages for athletes with device tokens
    const pushMessages: PushMessage[] = [];
    
    for (const session of upcomingSessions) {
      const athlete = session.program?.athlete;
      
      if (!athlete?.device_token || !athlete?.reminder_enabled) {
        console.log(`Skipping session ${session.id} - no device token or reminders disabled`);
        continue;
      }

      const sessionTime = new Date(session.date_time);
      const timeStr = sessionTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      // Format reminder time dynamically
      const reminderMinutes = athlete.reminder_frequency_minutes || 60;
      let timeUntilText;
      if (reminderMinutes < 60) {
        timeUntilText = `${reminderMinutes} minute${reminderMinutes !== 1 ? 's' : ''}`;
      } else if (reminderMinutes === 60) {
        timeUntilText = '1 hour';
      } else {
        const hours = Math.floor(reminderMinutes / 60);
        const mins = reminderMinutes % 60;
        if (mins === 0) {
          timeUntilText = `${hours} hour${hours !== 1 ? 's' : ''}`;
        } else {
          timeUntilText = `${hours}h ${mins}m`;
        }
      }

      pushMessages.push({
        to: athlete.device_token,
        title: '🏋️ Workout Reminder',
        body: `Your workout is starting in ${timeUntilText} at ${timeStr}`,
        data: {
          type: 'session_reminder',
          sessionId: session.id,
          sessionTime: session.date_time,
          programTitle: session.program?.title,
          reminderFrequency: reminderMinutes
        },
        channelId: 'workout-reminders',
        priority: 'high',
        sound: 'default'
      });
    }

    console.log(`Preparing to send ${pushMessages.length} push notifications`);

    if (pushMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No athletes with device tokens found',
          sent: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send push notifications
    const { sent, failed } = await sendBulkPushNotifications(pushMessages);

    console.log(`Sent ${sent} reminder(s), ${failed} failed`);

    // Log the activity for auditing
    if (sent > 0) {
      await supabase
        .from('notifications')
        .insert({
          type: 'reminder',
          title: 'Session Reminders Sent',
          message: `Sent ${sent} session reminder(s)`,
          meta: {
            sent_count: sent,
            failed_count: failed,
            session_ids: upcomingSessions.map(s => s.id)
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${sent} reminder(s)`,
        sent,
        failed,
        total_sessions: upcomingSessions.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in session reminders cron:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});