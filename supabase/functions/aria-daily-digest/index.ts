
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_ARIA_KEY") || Deno.env.get("OPENAI_API_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AthleteMetrics {
  coach_uuid: string;
  athlete_id: string;
  athlete_name: string;
  metrics: {
    athlete_name: string;
    readiness: number;
    sleep_hours: number;
    strain: number;
    acwr: number;
    latest_session: string;
    session_notes?: string;
  };
}

interface CoachInfo {
  email: string;
  full_name: string;
  plan_type: string;
  max_athletes: number;
}

serve(async (req) => {
  try {
    console.log("Starting ARIA daily digest generation...");

    // Fetch yesterday's athlete metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from("aria_digest_metrics_v")
      .select("*");

    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      throw metricsError;
    }

    if (!metricsData || metricsData.length === 0) {
      console.log("No metrics data found for yesterday");
      return new Response("No data to process", { status: 200 });
    }

    // Group athletes by coach
    const athletesByCoach: Record<string, AthleteMetrics[]> = {};
    metricsData.forEach((row: AthleteMetrics) => {
      if (!athletesByCoach[row.coach_uuid]) {
        athletesByCoach[row.coach_uuid] = [];
      }
      athletesByCoach[row.coach_uuid].push(row);
    });

    console.log(`Processing ${Object.keys(athletesByCoach).length} coaches`);

    // Process each coach
    for (const [coachUuid, athletes] of Object.entries(athletesByCoach)) {
      try {
        // Get coach info and plan limits
        const { data: coachData, error: coachError } = await supabase
          .from("profiles")
          .select(`
            email,
            full_name,
            billing_customers!inner(
              plan_id,
              plans!inner(
                type,
                max_athletes
              )
            )
          `)
          .eq("id", coachUuid)
          .single();

        if (coachError) {
          console.error(`Error fetching coach ${coachUuid}:`, coachError);
          continue;
        }

        const planType = coachData.billing_customers?.plans?.type || "coach";
        const maxAthletes = coachData.billing_customers?.plans?.max_athletes || 10;

        // Apply plan limits
        const limitedAthletes = athletes.slice(0, maxAthletes);
        
        if (athletes.length > maxAthletes) {
          console.log(`Coach ${coachUuid} has ${athletes.length} athletes, limiting to ${maxAthletes} for ${planType} plan`);
        }

        // Generate ARIA digest
        const digest = await generateDigest(limitedAthletes);

        // Insert notification
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: coachUuid,
            type: "digest",
            title: "Daily ARIA Digest",
            body: digest
          });

        if (notificationError) {
          console.error(`Error inserting notification for coach ${coachUuid}:`, notificationError);
          continue;
        }

        // Send email if configured
        if (resendApiKey && fromEmail) {
          try {
            await sendDigestEmail(coachData.email, coachData.full_name, digest);
            console.log(`Email sent to ${coachData.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${coachData.email}:`, emailError);
          }
        }

        console.log(`Digest generated for coach ${coachUuid} with ${limitedAthletes.length} athletes`);
      } catch (error) {
        console.error(`Error processing coach ${coachUuid}:`, error);
      }
    }

    return new Response("Daily digest generation completed", { status: 200 });
  } catch (error) {
    console.error("Error in daily digest function:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

async function generateDigest(athletes: AthleteMetrics[]): Promise<string> {
  if (!openaiApiKey) {
    return generateSimpleDigest(athletes);
  }

  try {
    const athleteData = athletes.map(a => ({
      name: a.metrics.athlete_name,
      readiness: a.metrics.readiness,
      sleep_hours: a.metrics.sleep_hours,
      strain: a.metrics.strain,
      acwr: a.metrics.acwr,
      latest_session: a.metrics.latest_session,
      notes: a.metrics.session_notes
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: `You are ARIA, a world-class strength and conditioning AI coach. 
            
Generate a concise daily digest (max 150 words) with:
1. Key insights and trends across all athletes
2. Specific athlete flags for attention (injury risk, low readiness, poor sleep)
3. Actionable recommendations

Format as bulleted list. Be direct and practical.`
          },
          {
            role: "user",
            content: `Yesterday's athlete metrics:\n${JSON.stringify(athleteData, null, 2)}`
          }
        ]
      })
    });

    const result = await response.json();
    return result.choices?.[0]?.message?.content || generateSimpleDigest(athletes);
  } catch (error) {
    console.error("Error generating AI digest:", error);
    return generateSimpleDigest(athletes);
  }
}

function generateSimpleDigest(athletes: AthleteMetrics[]): string {
  const flags = [];
  const insights = [];

  athletes.forEach(athlete => {
    const { athlete_name, readiness, sleep_hours, acwr } = athlete.metrics;
    
    if (readiness < 40) {
      flags.push(`⚠️ ${athlete_name}: Low readiness (${Math.round(readiness)}%)`);
    }
    
    if (sleep_hours < 6) {
      flags.push(`😴 ${athlete_name}: Poor sleep (${sleep_hours.toFixed(1)}h)`);
    }
    
    if (acwr > 1.5) {
      flags.push(`📈 ${athlete_name}: High training load (ACWR: ${acwr.toFixed(2)})`);
    }
  });

  const avgReadiness = athletes.reduce((sum, a) => sum + a.metrics.readiness, 0) / athletes.length;
  const avgSleep = athletes.reduce((sum, a) => sum + a.metrics.sleep_hours, 0) / athletes.length;

  insights.push(`📊 Team averages: ${Math.round(avgReadiness)}% readiness, ${avgSleep.toFixed(1)}h sleep`);
  
  if (flags.length === 0) {
    insights.push("✅ No immediate concerns - team looking strong");
  }

  return [
    "**Daily ARIA Digest**",
    "",
    ...insights,
    "",
    ...(flags.length > 0 ? ["**Attention Required:**", ...flags] : [])
  ].join("\n");
}

async function sendDigestEmail(email: string, name: string, digest: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `ARIA Daily <${fromEmail}>`,
      to: email,
      subject: "Your Daily ARIA Digest",
      html: `
        <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">Good morning, ${name}!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #5e6ad2;">
            <pre style="font-family: Inter, sans-serif; white-space: pre-wrap; margin: 0; line-height: 1.5;">${digest}</pre>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Generated by ARIA • <a href="https://catalyft.ai" style="color: #5e6ad2;">View in app</a>
          </p>
        </div>
      `
    })
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.status}`);
  }
}
