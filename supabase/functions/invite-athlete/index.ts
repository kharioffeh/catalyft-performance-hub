
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Log every incoming request immediately
  console.log("invite_athlete: Received request", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers),
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("invite_athlete: Handling CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the raw request body before any parsing
    const rawBody = await req.clone().text();
    console.log("invite_athlete: Raw request body:", rawBody);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create a client with the user's token for proper RLS context
    const authHeader = req.headers.get('Authorization');
    console.log("invite_athlete: Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.log("invite_athlete: No authorization header found");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create authenticated client using the user's token
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    console.log("invite_athlete: Attempting to get user from authenticated client");
    
    // Get user using the authenticated client
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.log("invite_athlete: User verification failed:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: User verified:", userData.user.email, "User ID:", userData.user.id);

    // Now check profile using the authenticated client (respects RLS)
    console.log("invite_athlete: Looking up profile for user ID:", userData.user.id);
    
    const { data: profile, error: profileError } = await supabaseUser
      .from('profiles')
      .select('role, email')
      .eq('id', userData.user.id)
      .single();

    console.log("invite_athlete: Profile query result:", { 
      profile, 
      profileError
    });

    // Check if we have a profile
    if (profileError) {
      console.log("invite_athlete: Profile query error:", profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to check user profile: ' + profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      console.log("invite_athlete: No profile found for user");
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: Found profile:", profile);

    if (profile.role !== 'coach') {
      console.log("invite_athlete: User is not a coach. Role:", profile.role);
      return new Response(
        JSON.stringify({ error: 'Only coaches can invite athletes' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get coach record using the email from the profile
    console.log("invite_athlete: Looking up coach record for email:", profile.email);
    
    const { data: coachData, error: coachError } = await supabaseUser
      .from('coaches')
      .select('id')
      .eq('email', profile.email)
      .single();

    console.log("invite_athlete: Coach lookup result:", { coachData, coachError });

    if (coachError || !coachData) {
      console.log("invite_athlete: Coach record not found");
      return new Response(
        JSON.stringify({ error: 'Coach record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(rawBody);
    } catch (parseError) {
      console.log("invite_athlete: Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email } = requestData;
    console.log("invite_athlete: Extracted email:", email);
    
    if (!email) {
      console.log("invite_athlete: No email provided");
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if athlete is already invited or exists
    const { data: existingInvite } = await supabaseUser
      .from('athlete_invites')
      .select('*')
      .eq('coach_uuid', coachData.id)
      .eq('email', email.toLowerCase())
      .single();

    console.log("invite_athlete: Existing invite check:", existingInvite);

    if (existingInvite) {
      console.log("invite_athlete: Athlete already invited");
      return new Response(
        JSON.stringify({ error: 'Athlete already invited' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: Sending invite email using Supabase Auth");

    // Send invite email using Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { 
          role: 'athlete',
          coach_id: coachData.id
        },
        redirectTo: `${Deno.env.get('APP_URL') || 'https://catalyft.app'}/finish-signup`
      }
    );

    console.log("invite_athlete: Invite result:", { inviteData, inviteError });

    if (inviteError) {
      console.error('invite_athlete: Invite error:', inviteError);
      return new Response(
        JSON.stringify({ error: `Failed to send invite: ${inviteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the invite in our database
    console.log("invite_athlete: Recording invite in database");
    const { error: insertError } = await supabaseUser
      .from('athlete_invites')
      .insert({
        coach_uuid: coachData.id,
        email: email.toLowerCase()
      });

    if (insertError) {
      console.error('invite_athlete: Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record invite' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: Invite process completed successfully");
    return new Response(
      JSON.stringify({ 
        message: 'Invite sent successfully',
        email: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('invite_athlete: Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
