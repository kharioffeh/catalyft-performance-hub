
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
        JSON.stringify({ error: 'Invalid token' }),
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
    
    const { data: coachData, error: coachError } = await supabaseAuth
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

    const { email, resend = false } = requestData;
    console.log("invite_athlete: Extracted email:", email, "Resend:", resend);
    
    if (!email) {
      console.log("invite_athlete: No email provided");
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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
          error: 'Athlete has already accepted the invite',
          hasPendingInvite: false
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

    console.log("invite_athlete: Creating user and sending custom invite email");

    // Generate proper magic link for signup
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        data: { 
          role: 'athlete',
          coach_id: coachData.id,
          coach_name: profile.full_name || profile.email
        },
        redirectTo: `${Deno.env.get('APP_URL') || 'https://catalyft.app'}/finish-signup`
      }
    });

    console.log("invite_athlete: Magic link generation result:", { magicLinkData, magicLinkError });

    if (magicLinkError || !magicLinkData.properties?.action_link) {
      console.error('invite_athlete: Magic link generation failed:', magicLinkError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate magic link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const magicLink = magicLinkData.properties.action_link;
    
    // Send custom email using Resend
    console.log("invite_athlete: Sending custom invite email with magic link");
    
    const emailHtml = `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8" />
    <title>Welcome to Catalyft AI</title>
    <meta name="color-scheme" content="light dark" />
    <style>
      /* -------- root brand colours -------- */
      :root {
        --bg: #f8f8f8;
        --card: #ffffff;
        --accent: #00ff7b;
        --text: #131313;
        --link: #5bafff;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #131313;
          --card: #1e1e1e;
          --accent: #00ff7b;
          --text: #f8f8f8;
          --link: #5bafff;
        }
      }

      body {
        margin: 0;
        padding: 0;
        background: var(--bg);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: var(--text);
      }
      .wrapper {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        padding: 32px 16px;
      }
      .card {
        background: var(--card);
        border-radius: 20px;
        padding: 32px 24px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.05);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 1.5rem;
        line-height: 1.2;
      }
      p {
        margin: 0 0 18px;
        line-height: 1.5;
      }
      .cta {
        display: block;
        text-align: center;
        background: var(--accent);
        color: #000;
        text-decoration: none;
        padding: 14px 20px;
        border-radius: 14px;
        font-weight: 600;
        margin: 24px 0;
      }
      .sub {
        font-size: 0.8rem;
        color: #838383;
      }
    </style>
  </head>

  <body>
    <div class="wrapper">
      <div class="card">
        <h1>🚀 Time to elevate your training</h1>

        <p><strong>${profile.full_name || profile.email}</strong> just added you to their
           Catalyft AI squad. One tap and you'll unlock:</p>
        <ul style="padding-left:20px;margin:0 0 18px;">
          <li>Daily readiness score</li>
          <li>AI-generated, auto-adjusting workouts</li>
          <li>All your wearable data in one dashboard</li>
        </ul>

        <a href="${magicLink}" class="cta">Accept invite &amp; set up profile</a>

        <p class="sub">
          Link not working? Copy &amp; paste this URL into your browser:<br />
          ${magicLink}
        </p>
        <p class="sub">
          You received this email because someone (hopefully you!) entered this address on <a href="${Deno.env.get('APP_URL') || 'https://catalyft.app'}" style="color:var(--link);text-decoration:none;">Catalyft AI</a>.<br />
          If that wasn't you, simply ignore this message.
        </p>
      </div>
    </div>
  </body>
</html>`;

    // Use Resend to send the email
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('invite_athlete: RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Catalyft AI <noreply@catalyft.app>',
        to: [email],
        subject: resend ? '🚀 Reminder: You\'re invited to join Catalyft AI' : '🚀 You\'re invited to join Catalyft AI',
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("invite_athlete: Email send result:", emailResult);

    if (!emailResponse.ok) {
      console.error('invite_athlete: Email send failed:', emailResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send invite email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          JSON.stringify({ error: 'Failed to update invite record' }),
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
          JSON.stringify({ error: 'Failed to record invite' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
