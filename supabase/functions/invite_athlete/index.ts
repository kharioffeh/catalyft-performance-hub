
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

    // Initialize Supabase clients
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ADMIN_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);
    const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);

    // 1. Authenticate and extract coach_id from JWT
    const authHeader = req.headers.get("Authorization") || "";
    const [, token] = authHeader.split(" ");
    if (!token) {
      logStep("No authorization token");
      return new Response(JSON.stringify({ error: "No authorization token" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify token and get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      logStep("Invalid token", { error: userError });
      return new Response(JSON.stringify({ error: "Invalid token" }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Ensure user is a coach: check profile role
    const coachId = user.id;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", coachId)
      .single();

    if (profileError || profile?.role !== "coach") {
      logStep("User is not a coach", { error: profileError, role: profile?.role });
      return new Response(JSON.stringify({ error: "Only coaches can invite" }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const coachName = profile.full_name || "";
    logStep("Coach verified", { coachId, coachName });

    // 2. Parse request body
    let body: { email: string; name?: string };
    try {
      body = await req.json();
    } catch {
      logStep("Invalid JSON body");
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { email, name = null } = body;
    if (!email) {
      logStep("Email is required");
      return new Response(JSON.stringify({ error: "Email is required" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logStep("Request body parsed", { email, name });

    // 3. Send Supabase magic-link invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { provisional: true, coach_id: coachId, coach_name: coachName },
        redirectTo: `${Deno.env.get("APP_URL")}/finish-signup`,
      }
    );

    if (inviteError) {
      logStep("Failed to send invite email", { error: inviteError });
      return new Response(JSON.stringify({ error: inviteError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logStep("Invite email sent", { inviteData });

    // 4. Insert into athlete_invites using admin client to bypass RLS
    const { error: insertError } = await supabaseAdmin
      .from("athlete_invites")
      .insert([{ coach_uuid: coachId, email, athlete_name: name, status: 'pending' }]);

    if (insertError) {
      logStep("Failed to insert invite record", { error: insertError });
      return new Response(JSON.stringify({ error: insertError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    logStep("Invite record created successfully");

    return new Response(JSON.stringify({ status: "invite_sent", invite: inviteData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in invite-athlete", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
