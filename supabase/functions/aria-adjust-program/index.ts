
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AthleteMetrics {
  id: string;
  timezone: string | null;
  last_readiness: number | null;
  last_strain: number | null;
}

interface SessionPayload {
  volume?: number;
  load?: number;
  target_rpe?: number;
  intensity?: number;
  [key: string]: any;
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

    console.log('Starting adaptive program adjustment process...');

    // First, update the athlete metrics cache
    const { error: cacheError } = await supabase.rpc('update_athlete_metrics_cache');
    if (cacheError) {
      console.error('Error updating metrics cache:', cacheError);
    }

    // Get all athletes with their latest metrics
    const { data: athletes, error: athletesError } = await supabase
      .from('profiles')
      .select('id, timezone, last_readiness, last_strain')
      .not('last_readiness', 'is', null)
      .not('last_strain', 'is', null);

    if (athletesError) {
      throw new Error(`Failed to fetch athletes: ${athletesError.message}`);
    }

    console.log(`Processing ${athletes?.length || 0} athletes...`);

    let totalAdjustments = 0;

    for (const athlete of athletes || []) {
      try {
        const adjustments = await processAthleteAdjustments(supabase, athlete);
        totalAdjustments += adjustments;
        console.log(`Processed athlete ${athlete.id}: ${adjustments} adjustments`);
      } catch (error) {
        console.error(`Error processing athlete ${athlete.id}:`, error);
      }
    }

    console.log(`Adaptive program adjustment completed. Total adjustments: ${totalAdjustments}`);

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
  const timezone = athlete.timezone || 'UTC';
  const readiness = athlete.last_readiness || 0;
  const strain = athlete.last_strain || 0;

  // Calculate tomorrow's date in the athlete's timezone
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  console.log(`Processing athlete ${athlete.id}: readiness=${readiness}, strain=${strain}, date=${tomorrowDateStr}`);

  // Get tomorrow's planned sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('athlete_uuid', athlete.id)
    .gte('start_ts', `${tomorrowDateStr}T00:00:00`)
    .lt('start_ts', `${tomorrowDateStr}T23:59:59`)
    .eq('status', 'planned');

  if (sessionsError) {
    console.error(`Error fetching sessions for athlete ${athlete.id}:`, sessionsError);
    return 0;
  }

  if (!sessions || sessions.length === 0) {
    console.log(`No planned sessions found for athlete ${athlete.id} on ${tomorrowDateStr}`);
    return 0;
  }

  const adjustmentRows: any[] = [];
  let adjustmentsMade = 0;

  for (const session of sessions) {
    const adjustment = calculateAdjustment(readiness, strain);
    
    if (adjustment.factor !== 1.0) {
      const oldPayload = session.payload || {};
      const newPayload = applyAdjustment(oldPayload, adjustment.factor);

      // Update the session with new payload
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ payload: newPayload })
        .eq('id', session.id);

      if (updateError) {
        console.error(`Error updating session ${session.id}:`, updateError);
        continue;
      }

      // Log the adjustment
      adjustmentRows.push({
        session_id: session.id,
        athlete_uuid: athlete.id,
        reason: adjustment.reason,
        old_payload: oldPayload,
        new_payload: newPayload,
        adjustment_factor: adjustment.factor
      });

      adjustmentsMade++;

      // Send notification
      await sendAdjustmentNotification(supabase, athlete.id, session, adjustment);
    }
  }

  // Insert adjustment logs
  if (adjustmentRows.length > 0) {
    const { error: insertError } = await supabase
      .from('program_adjustments')
      .insert(adjustmentRows);

    if (insertError) {
      console.error(`Error inserting adjustment logs:`, insertError);
    }
  }

  return adjustmentsMade;
}

function calculateAdjustment(readiness: number, strain: number): { factor: number; reason: string } {
  // Low readiness or high strain - reduce intensity
  if (readiness < 50 || strain > 18) {
    return {
      factor: 0.85, // 15% reduction
      reason: readiness < 50 ? 'low_readiness' : 'over_strain'
    };
  }
  
  // High readiness and low strain - increase intensity
  if (readiness > 80 && strain < 8) {
    return {
      factor: 1.10, // 10% increase
      reason: 'high_readiness'
    };
  }

  // No adjustment needed
  return { factor: 1.0, reason: '' };
}

function applyAdjustment(payload: SessionPayload, factor: number): SessionPayload {
  const newPayload = { ...payload };
  
  // Apply factor to adjustable fields
  const adjustableFields = ['volume', 'load', 'target_rpe', 'intensity'];
  
  adjustableFields.forEach(field => {
    if (newPayload[field] && typeof newPayload[field] === 'number') {
      newPayload[field] = Math.round(newPayload[field] * factor * 100) / 100;
    }
  });

  // Add adjustment metadata
  newPayload.aria_adjusted = true;
  newPayload.adjustment_factor = factor;
  newPayload.adjusted_at = new Date().toISOString();

  return newPayload;
}

async function sendAdjustmentNotification(supabase: any, athleteId: string, session: any, adjustment: any) {
  const reasonText = {
    'low_readiness': 'low readiness detected',
    'high_readiness': 'high readiness detected', 
    'over_strain': 'high strain detected',
    'under_strain': 'low strain detected'
  };

  const adjustmentText = adjustment.factor < 1 ? 'reduced' : 'increased';
  const percentage = Math.abs((adjustment.factor - 1) * 100);

  const title = 'Session Auto-Adjusted';
  const body = `Your ${session.type} session has been ${adjustmentText} by ${percentage}% due to ${reasonText[adjustment.reason]}.`;

  // Insert notification
  await supabase
    .from('notifications')
    .insert({
      user_id: athleteId,
      type: 'system',
      title,
      body,
      meta: {
        session_id: session.id,
        adjustment_reason: adjustment.reason,
        adjustment_factor: adjustment.factor
      }
    });
}
