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

    // Calculate the time window for 1 hour from now
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    // Create a 5-minute window around the target time to account for cron timing
    const startTime = new Date(oneHourFromNow.getTime() - 2.5 * 60 * 1000); // 2.5 minutes before
    const endTime = new Date(oneHourFromNow.getTime() + 2.5 * 60 * 1000);   // 2.5 minutes after

    console.log('Looking for sessions between:', startTime.toISOString(), 'and', endTime.toISOString());

    // Find sessions that are scheduled to start in ~1 hour
    const { data: upcomingSessions, error: sessionsError } = await supabase
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
            email
          )
        )
      `)
      .eq('status', 'scheduled')
      .gte('date_time', startTime.toISOString())
      .lte('date_time', endTime.toISOString());

    if (sessionsError) {
      console.error('Error fetching upcoming sessions:', sessionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch upcoming sessions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
      
      if (!athlete?.device_token) {
        console.log(`Skipping session ${session.id} - no device token for athlete`);
        continue;
      }

      const sessionTime = new Date(session.date_time);
      const timeStr = sessionTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      pushMessages.push({
        to: athlete.device_token,
        title: '🏋️ Workout Reminder',
        body: `Your workout is starting in 1 hour at ${timeStr}`,
        data: {
          type: 'session_reminder',
          sessionId: session.id,
          sessionTime: session.date_time,
          programTitle: session.program?.title
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