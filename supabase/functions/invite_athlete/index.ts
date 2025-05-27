
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVITE-ATHLETE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize regular client for user verification
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify JWT and get user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Invalid token", { error: userError });
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("User authenticated", { userId: userData.user.id, email: userData.user.email });

    // Get coach_id from the coaches table
    const { data: coachData, error: coachError } = await supabaseAdmin
      .from('coaches')
      .select('id')
      .eq('email', userData.user.email)
      .single();

    if (coachError || !coachData) {
      logStep("User is not a coach", { error: coachError });
      return new Response(JSON.stringify({ error: "User is not a coach" }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coachId = coachData.id;
    logStep("Coach verified", { coachId });

    // Parse request body
    const { email, name } = await req.json();
    if (!email || !name) {
      logStep("Missing required fields", { email: !!email, name: !!name });
      return new Response(JSON.stringify({ error: "Email and name are required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Request body parsed", { email, name });

    // Check coach's athlete quota
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('coach_usage')
      .select('athlete_count')
      .eq('coach_uuid', coachId)
      .single();

    let currentCount = 0;
    if (!usageError && usageData) {
      currentCount = usageData.athlete_count;
    }

    logStep("Current athlete count", { currentCount });

    // For now, enforce a limit of 20 athletes (this can be made configurable later)
    if (currentCount >= 20) {
      logStep("Athlete limit exceeded", { currentCount, limit: 20 });
      return new Response(JSON.stringify({ 
        error: "Athlete limit exceeded. Please upgrade your plan to add more athletes." 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if email is already invited or exists as athlete
    const { data: existingInvite } = await supabaseAdmin
      .from('athlete_invites')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('coach_uuid', coachId)
      .single();

    if (existingInvite) {
      if (existingInvite.status === 'pending') {
        logStep("Resending existing invite", { email });
        // Instead of returning an error, we'll resend the invite
        // by continuing with the flow - this will trigger a new email
      } else if (existingInvite.status === 'accepted') {
        logStep("Invite already accepted", { email });
        return new Response(JSON.stringify({ 
          error: "This athlete has already accepted an invitation" 
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get coach name for email customization
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', userData.user.email)
      .single();

    const coachName = profileData?.full_name || 'Your coach';

    // Determine redirect URL based on environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const isLocal = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
    const redirectTo = isLocal ? "http://localhost:5173/invite-complete" : "https://catalyft.app/invite-complete";

    // Send invitation email using Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { 
        provisional: true,
        coach_id: coachId,
        athlete_name: name,
        coach_name: coachName
      }
    });

    if (inviteError) {
      logStep("Failed to send invite email", { error: inviteError });
      return new Response(JSON.stringify({ 
        error: `Failed to send invitation: ${inviteError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Invite email sent", { inviteData });

    // Insert or update invitation record
    if (existingInvite && existingInvite.status === 'pending') {
      // Update existing invite
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('athlete_invites')
        .update({
          athlete_name: name,
          created_at: new Date().toISOString() // Update timestamp for resend
        })
        .eq('id', existingInvite.id)
        .select()
        .single();

      if (updateError) {
        logStep("Failed to update invite record", { error: updateError });
        return new Response(JSON.stringify({ 
          error: `Failed to update invitation: ${updateError.message}` 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      logStep("Invite record updated", { updateData });

      return new Response(JSON.stringify({ 
        status: "resent",
        invitation_id: updateData.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Insert new invitation record
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('athlete_invites')
        .insert({
          coach_uuid: coachId,
          email: email.toLowerCase(),
          athlete_name: name,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        logStep("Failed to insert invite record", { error: insertError });
        return new Response(JSON.stringify({ 
          error: `Failed to record invitation: ${insertError.message}` 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      logStep("Invite record created", { insertData });

      return new Response(JSON.stringify({ 
        status: "sent",
        invitation_id: insertData.id
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in invite-athlete", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
