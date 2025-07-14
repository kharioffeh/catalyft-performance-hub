
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    if (profileError || !profile) {
      console.log("invite_athlete: Profile query error:", profileError);
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

    const { email, name, startDate, resend: shouldResend = false } = requestData;
    console.log("invite_athlete: Extracted email:", email, "Resend:", shouldResend);
    
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
    if (existingInvite && existingInvite.status === 'pending' && !shouldResend) {
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

    // Send Supabase magic-link invite
    console.log("invite_athlete: Creating Supabase magic link invite");
    const appUrl = Deno.env.get('APP_URL') || 'https://catalyft.app';
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { 
        provisional: true, 
        coach_id: coachData.id,
        invited_by: profile.full_name,
        athlete_name: name,
        start_date: startDate
      },
      redirectTo: `${appUrl}/finish-signup`,
    });

    if (inviteError) {
      console.error("invite_athlete: Supabase invite error:", inviteError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to create invite link' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("invite_athlete: Supabase invite created successfully");

    // Send branded email via Resend
    console.log("invite_athlete: Sending email via Resend");
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@catalyft.app';

    if (!resendApiKey) {
      console.error("invite_athlete: Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email service not configured' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    try {
      const greeting = name ? `Hi ${name},` : 'Hi there,';
      const startDateText = startDate ? `<p><strong>Training Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>` : '';
      
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "You've been invited to Catalyft AI",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to Catalyft AI</h1>
            <p>${greeting}</p>
            <p><strong>${profile.full_name}</strong> has invited you to join Catalyft AI, a comprehensive platform for athletic performance tracking and coaching.</p>
            ${startDateText}
            <div style="margin: 30px 0;">
              <a href="${inviteData.properties?.action_link}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>This invitation link will expire in 24 hours. If you weren't expecting this email, you can safely ignore it.</p>
            <p>Best regards,<br>The Catalyft AI Team</p>
          </div>
        `,
      });

      console.log("invite_athlete: Email sent successfully:", emailResult);
    } catch (emailError) {
      console.error("invite_athlete: Email sending failed:", emailError);
      // Don't fail the entire request if email fails
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
        message: shouldResend ? 'Invite resent successfully' : 'Invite sent successfully',
        email: email,
        resent: shouldResend
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
