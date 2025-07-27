import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"
import { publishEvent } from "../_shared/ably.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { meet_id, status } = await req.json();

    // Validate required fields
    if (!meet_id || typeof meet_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Meet ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!status || !['yes', 'no', 'maybe'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Status must be one of: yes, no, maybe' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the meet exists
    const { data: meet, error: meetError } = await supabase
      .from('meets')
      .select('id, title')
      .eq('id', meet_id)
      .single();

    if (meetError || !meet) {
      return new Response(
        JSON.stringify({ error: 'Meet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} RSVPing ${status} to meet: ${meet.title}`);

    // Upsert RSVP (update if exists, insert if not)
    const { data: rsvp, error: upsertError } = await supabase
      .from('meet_rsvps')
      .upsert({
        meet_id: meet_id,
        user_id: user.id,
        status: status,
        rsvp_at: new Date().toISOString()
      }, {
        onConflict: 'meet_id,user_id'
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting RSVP:', upsertError);
      return new Response(
        JSON.stringify({ error: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully upserted RSVP ${rsvp.id}`);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "meetRSVPUpdated", { meet_id, rsvp_id: rsvp.id, status });

    return new Response(
      JSON.stringify({ rsvp }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})