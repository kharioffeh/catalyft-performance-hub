
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AthleteMetrics {
  id: string;
  timezone: string | null;
  last_readiness: number | null;
  acwr_7_28: number | null;
}

interface SessionAdjustment {
  session_id: string;
  athlete_uuid: string;
  reason: string;
  old_load: number | null;
  new_load: number | null;
  adjustment_factor: number;
  old_status: string;
  new_status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting ACWR-based program adjustment process...');

    // Get all athletes with their latest readiness and ACWR data
    const { data: athletes, error: athletesError } = await supabase
      .from('profiles')
      .select(`
        id,
        timezone,
        last_readiness
      `)
      .not('last_readiness', 'is', null);

    if (athletesError) {
      throw new Error(`Failed to fetch athletes: ${athletesError.message}`);
    }

    console.log(`Processing ${athletes?.length || 0} athletes...`);

    let totalAdjustments = 0;

    for (const athlete of athletes || []) {
      try {
        // Get latest ACWR for this athlete
        const { data: acwrData, error: acwrError } = await supabase
          .from('vw_load_acwr')
          .select('acwr_7_28')
          .eq('athlete_uuid', athlete.id)
          .order('day', { ascending: false })
          .limit(1);

        if (acwrError) {
          console.error(`Error fetching ACWR for athlete ${athlete.id}:`, acwrError);
          continue;
        }

        const athleteWithAcwr = {
          ...athlete,
          acwr_7_28: acwrData?.[0]?.acwr_7_28 || null
        };

        const adjustments = await processAthleteAdjustments(supabase, athleteWithAcwr);
        totalAdjustments += adjustments;
        console.log(`Processed athlete ${athlete.id}: ${adjustments} adjustments`);
      } catch (error) {
        console.error(`Error processing athlete ${athlete.id}:`, error);
      }
    }

    console.log(`ACWR-based program adjustment completed. Total adjustments: ${totalAdjustments}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        athletesProcessed: athletes?.length || 0,
        totalAdjustments 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in aria-adjust-program:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function processAthleteAdjustments(supabase: any, athlete: AthleteMetrics): Promise<number> {
  const readiness = athlete.last_readiness || 0;
  const acwr = athlete.acwr_7_28 || 0;

  // Calculate today's date in the athlete's timezone
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  console.log(`Processing athlete ${athlete.id}: readiness=${readiness}, acwr=${acwr}, date=${todayDateStr}`);

  // Check if adjustment is needed based on requirements
  const shouldAdjust = readiness < 60 || acwr > 1.5;
  
  if (!shouldAdjust) {
    console.log(`No adjustment needed for athlete ${athlete.id}: readiness=${readiness}, acwr=${acwr}`);
    return 0;
  }

  // Get today's active program sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('program_sessions')
    .select('*')
    .eq('athlete_uuid', athlete.id)
    .gte('scheduled_date', `${todayDateStr}T00:00:00`)
    .lt('scheduled_date', `${todayDateStr}T23:59:59`)
    .neq('status', 'deload') // Don't re-adjust already deloaded sessions
    .in('status', ['scheduled', 'active', 'planned']); // Only adjust active sessions

  if (sessionsError) {
    console.error(`Error fetching program sessions for athlete ${athlete.id}:`, sessionsError);
    return 0;
  }

  if (!sessions || sessions.length === 0) {
    console.log(`No active program sessions found for athlete ${athlete.id} on ${todayDateStr}`);
    return 0;
  }

  const adjustmentRows: SessionAdjustment[] = [];
  let adjustmentsMade = 0;

  for (const session of sessions) {
    const reason = readiness < 60 ? 'low_readiness' : 'high_acwr';
    const oldLoad = session.planned_load || session.volume || null;
    const newLoad = oldLoad ? Math.round(oldLoad * 0.7 * 100) / 100 : null; // 30% reduction for deload

    // Update session status to 'deload'
    const { error: updateError } = await supabase
      .from('program_sessions')
      .update({ 
        status: 'deload',
        deload_reason: reason,
        deloaded_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error(`Error updating session ${session.id}:`, updateError);
      continue;
    }

    // Prepare adjustment log
    adjustmentRows.push({
      session_id: session.id,
      athlete_uuid: athlete.id,
      reason,
      old_load: oldLoad,
      new_load: newLoad,
      adjustment_factor: 0.7,
      old_status: session.status,
      new_status: 'deload'
    });

    adjustmentsMade++;

    // Send realtime broadcast
    await sendSessionAdjustedBroadcast(supabase, athlete.id, session, reason);
  }

  // Insert adjustment logs into session_adjustments table
  if (adjustmentRows.length > 0) {
    const { error: insertError } = await supabase
      .from('session_adjustments')
      .insert(adjustmentRows);

    if (insertError) {
      console.error(`Error inserting session adjustment logs:`, insertError);
      // Don't fail the process if logging fails
    }
  }

  return adjustmentsMade;
}

async function sendSessionAdjustedBroadcast(supabase: any, athleteId: string, session: any, reason: string) {
  try {
    const payload = {
      event: 'session_adjusted',
      athlete_id: athleteId,
      session_id: session.id,
      reason,
      timestamp: new Date().toISOString(),
      message: reason === 'low_readiness' 
        ? 'Session deloaded due to low readiness score'
        : 'Session deloaded due to high ACWR (injury risk)'
    };

    // Send realtime broadcast to the specific athlete
    const { error } = await supabase
      .channel(`athlete:${athleteId}`)
      .send({
        type: 'broadcast',
        event: 'session_adjusted',
        payload
      });

    if (error) {
      console.error(`Error sending realtime broadcast for athlete ${athleteId}:`, error);
    } else {
      console.log(`Sent session_adjusted broadcast for athlete ${athleteId}, session ${session.id}`);
    }
  } catch (error) {
    console.error(`Error in sendSessionAdjustedBroadcast:`, error);
  }
}
