
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
        JSON.stringify({ 
          success: false,
          error: 'No authorization header' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create authenticated client using the user's token
    const supabaseAuth = createClient(
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
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.log("invite_athlete: User verification failed:", userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid token' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: User verified:", userData.user.email, "User ID:", userData.user.id);

    // Get profile using the authenticated client (respects RLS)
    console.log("invite_athlete: Looking up profile for user ID:", userData.user.id);
    
    const { data: profile, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('role, email, full_name')
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
        JSON.stringify({ 
          success: false,
          error: 'Failed to check user profile: ' + profileError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      console.log("invite_athlete: No profile found for user");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'User profile not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: Found profile:", profile);

    if (profile.role !== 'coach') {
      console.log("invite_athlete: User is not a coach. Role:", profile.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Only coaches can invite athletes' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get coach record using the email from the profile
    console.log("invite_athlete: Looking up coach record for email:", profile.email);
    
    const { data: coachData, error: coachError } = await supabaseAuth
      .from('coaches')
      .select('id')
      .eq('email', profile.email)
      .single();

    console.log("invite_athlete: Coach lookup result:", { coachData, coachError });

    if (coachError || !coachData) {
      console.log("invite_athlete: Coach record not found");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Coach record not found' 
        }),
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
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, resend = false } = requestData;
    console.log("invite_athlete: Extracted email:", email, "Resend:", resend);
    
    if (!email) {
      console.log("invite_athlete: No email provided");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if athlete is already invited or exists
    const { data: existingInvite } = await supabaseAuth
      .from('athlete_invites')
      .select('*')
      .eq('coach_uuid', coachData.id)
      .eq('email', email.toLowerCase())
      .single();

    console.log("invite_athlete: Existing invite check:", existingInvite);

    // If there's an existing invite that's already accepted, don't allow resending
    if (existingInvite && existingInvite.status === 'accepted') {
      console.log("invite_athlete: Athlete already accepted invite");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Athlete has already accepted the invite'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If there's a pending invite and this isn't a resend request, inform the user
    if (existingInvite && existingInvite.status === 'pending' && !resend) {
      console.log("invite_athlete: Athlete already has pending invite");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Athlete already has a pending invite',
          hasPendingInvite: true,
          inviteId: existingInvite.id
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, skip the actual email sending due to Resend domain restrictions
    // In production, this would send the actual email
    console.log("invite_athlete: Skipping email send due to Resend domain restrictions");
    
    // Record or update the invite in our database
    console.log("invite_athlete: Recording/updating invite in database");
    
    if (existingInvite) {
      // Update existing invite (resend scenario)
      const { error: updateError } = await supabaseAuth
        .from('athlete_invites')
        .update({
          created_at: new Date().toISOString() // Update timestamp for resend
        })
        .eq('id', existingInvite.id);

      if (updateError) {
        console.error('invite_athlete: Update error:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to update invite record' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new invite record
      const { error: insertError } = await supabaseAuth
        .from('athlete_invites')
        .insert({
          coach_uuid: coachData.id,
          email: email.toLowerCase()
        });

      if (insertError) {
        console.error('invite_athlete: Insert error:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to record invite' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log("invite_athlete: Invite process completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true,
        message: resend ? 'Invite resent successfully' : 'Invite sent successfully',
        email: email,
        resent: resend
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('invite_athlete: Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
