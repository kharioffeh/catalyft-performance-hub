
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey = Deno.env.get("OPENAI_ARIA_KEY")!;
const resendKey = Deno.env.get("RESEND_API_KEY")!;
const appUrl = Deno.env.get("APP_URL") || "https://app.catalyft.ai";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklySummaryRequest {
  debug?: boolean;
}

interface WeeklyMetrics {
  readiness_avg: number;
  sleep_avg: number;
  acwr_latest: number;
  strain_latest: number;
  readiness_trend: string;
  sleep_trend: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { debug = false }: WeeklySummaryRequest = await req.json();
    
    // Calculate last week's date range (Monday to Sunday)
    const now = new Date();
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - now.getDay() - 6); // Go back to last Monday
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    
    const periodStart = lastMonday.toISOString().split('T')[0];
    const periodEnd = lastSunday.toISOString().split('T')[0];

    console.log(`Processing weekly summaries for period ${periodStart} to ${periodEnd}`);

    // Coach functionality has been removed - processing solo athletes only
    let processedCount = 0;
    let errorCount = 0;
    
    // Process solo athletes
    const { data: soloAthletes } = await supabase
      .from('profiles')
      .select('id, email, full_name, timezone, weekly_summary_opt_in')
      .eq('role', 'solo')
      .eq('weekly_summary_opt_in', true);

    if (soloAthletes) {
      for (const athlete of soloAthletes) {
        try {
          const athleteId = athlete.id;
          
          // Check if summary already exists for this period
          const { data: existingSummary } = await supabase
            .from('weekly_summaries')
            .select('id')
            .eq('owner_uuid', athleteId)
            .eq('period_end', periodEnd)
            .single();

          if (existingSummary) {
            console.log(`Summary already exists for solo athlete ${athlete.email}`);
            continue;
          }

          // Get metrics for this athlete
          const { data: metrics } = await supabase
            .rpc('get_weekly_metrics', {
              p_athlete_uuid: athleteId,
              p_start_date: periodStart,
              p_end_date: periodEnd
            });

          if (!metrics) {
            console.log(`No metrics data for solo athlete ${athlete.email}`);
            continue;
          }

          // Generate AI summary
          const summaryMarkdown = await generateSoloSummary(metrics as WeeklyMetrics, athlete.full_name || athlete.email);

          // Save summary to database
          const { data: savedSummary, error: saveError } = await supabase
            .from('weekly_summaries')
            .insert({
              owner_uuid: athleteId,
              role: 'solo',
              period_start: periodStart,
              period_end: periodEnd,
              summary_md: summaryMarkdown
            })
            .select()
            .single();

          if (saveError) {
            console.error(`Error saving summary for solo athlete ${athlete.email}:`, saveError);
            errorCount++;
            continue;
          }

          // Send email
          if (!debug) {
            await sendWeeklySummaryEmail(athlete.email, athlete.full_name || athlete.email, summaryMarkdown, 'solo');
          }

          // Mark as delivered
          await supabase
            .from('weekly_summaries')
            .update({ delivered: true })
            .eq('id', savedSummary.id);

          processedCount++;
          console.log(`Processed solo athlete: ${athlete.email}`);

        } catch (error) {
          console.error(`Error processing solo athlete ${athlete.email}:`, error);
          errorCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        period: { start: periodStart, end: periodEnd },
        processed: processedCount,
        errors: errorCount,
        debug
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in aria_weekly_summary function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function generateCoachSummary(athleteMetrics: any[], coachName: string): Promise<string> {
  const prompt = `You are ARIA, an AI sports performance analyst. Generate a weekly summary for coach ${coachName}.

ATHLETE METRICS DATA:
${JSON.stringify(athleteMetrics, null, 2)}

Generate a markdown-formatted weekly summary that includes:
1. **Week Overview** - Brief summary of team performance
2. **Key Metrics** - Average readiness, sleep, ACWR, and strain across all athletes
3. **Performance Insights** - 3-5 bullet points highlighting important trends
4. **Red Flag Alerts** - Any athletes with concerning metrics (readiness < 60%, ACWR > 1.6)
5. **Recommendations** - Specific focus areas for the upcoming week

Keep the tone professional but encouraging. Be specific about which athletes need attention.
Limit to 400 words maximum.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateSoloSummary(metrics: WeeklyMetrics, athleteName: string): Promise<string> {
  const prompt = `You are ARIA, an AI sports performance analyst. Generate a weekly summary for solo athlete ${athleteName}.

WEEKLY METRICS:
- Average Readiness: ${metrics.readiness_avg.toFixed(1)}% (${metrics.readiness_trend})
- Average Sleep: ${metrics.sleep_avg.toFixed(1)} hours (${metrics.sleep_trend})
- Current ACWR: ${metrics.acwr_latest.toFixed(2)}
- Latest Strain: ${metrics.strain_latest.toFixed(1)}

Generate a markdown-formatted weekly summary that includes:
1. **Week Overview** - Brief summary of performance
2. **Key Metrics** - Analysis of readiness, sleep, ACWR, and strain
3. **Performance Insights** - 3-4 bullet points highlighting important trends
4. **Areas of Focus** - What to pay attention to based on the data
5. **Next Week Goals** - Specific recommendations for improvement

Keep the tone motivational and personal. Be specific about what the data means.
Limit to 300 words maximum.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendWeeklySummaryEmail(email: string, name: string, summaryMarkdown: string, role: string): Promise<void> {
  const subject = `📊 Your Weekly Performance Summary`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Summary</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background: linear-gradient(135deg, #0f1117 0%, #1a1d29 100%);
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(15, 17, 23, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          padding: 32px;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #00ff7b;
          margin-bottom: 8px;
        }
        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
        }
        .content {
          margin-bottom: 32px;
        }
        .summary {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          border-left: 4px solid #00ff7b;
        }
        .cta {
          text-align: center;
          margin-top: 32px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #00ff7b 0%, #00cc66 100%);
          color: #0f1117;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .footer {
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          margin-top: 32px;
        }
        h1, h2, h3 { color: #ffffff; }
        h2 { color: #00ff7b; margin-top: 24px; }
        ul { padding-left: 16px; }
        li { margin-bottom: 8px; }
        strong { color: #00ff7b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CATALYFT AI</div>
          <div class="subtitle">Weekly Performance Summary</div>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          <p>Here's your AI-generated weekly performance summary from ARIA:</p>
          
          <div class="summary">
            ${markdownToHtml(summaryMarkdown)}
          </div>
        </div>
        
        <div class="cta">
          <a href="${appUrl}/analytics?range=last7d" class="button">
            📈 View Detailed Analytics
          </a>
        </div>
        
        <div class="footer">
          <p>This summary was generated by ARIA, your AI performance analyst.</p>
          <p>You can adjust your email preferences in your account settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "ARIA <aria@catalyft.ai>",
    to: [email],
    subject,
    html: htmlContent,
  });
}

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l|p])/gm, '<p>')
    .replace(/(?<![h|l|p]>)$/gm, '</p>')
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>/g, '</li></ul>')
    .replace(/<\/ul><ul>/g, '');
}

serve(handler);
