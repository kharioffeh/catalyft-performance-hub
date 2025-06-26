import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Zod schema for program validation
const BlockSchema = z.object({
  week: z.number().int(),
  sessions: z.array(z.object({
    day: z.enum(['Mon','Tue','Wed','Thu','Fri','Sat','Sun']),
    session_type: z.enum(['strength','conditioning','recovery']),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number().int().min(1),
      reps: z.number().int().min(1),
      intensity: z.string(),
      rest_sec: z.number().int().min(30),
      notes: z.string().optional()
    }))
  }))
});

const AriaProgramSchema = z.object({
  meta: z.object({
    goal: z.enum(['max_strength','hypertrophy','speed_power','in-season_maint']),
    weeks: z.number().int().min(2).max(12),
    metrics_available: z.boolean()
  }),
  blocks: z.array(BlockSchema)
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = (await import("https://deno.land/x/supabase_js@2.38.1/mod.ts")).createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const OPENAI_KEY = Deno.env.get("OPENAI_KEY_ARIA");
    if (!OPENAI_KEY) throw new Error("Missing OPENAI_KEY_ARIA");

    const input = await req.json();
    const { athlete_uuid, coach_uuid, goal, weeks, is_solo = false } = input;

    if (!athlete_uuid || !goal || !weeks)
      return new Response(JSON.stringify({ error: "Missing required params" }), { status: 400, headers: corsHeaders });

    // For solo users, athlete_uuid is the authenticated user
    // For coached users, coach_uuid must be provided
    if (!is_solo && !coach_uuid)
      return new Response(JSON.stringify({ error: "Coach UUID required for coached programs" }), { status: 400, headers: corsHeaders });

    // Fetch athlete profile
    const { data: athleteProfile, error: profileError } = await supabaseClient
      .from("athletes").select("id, name").eq("id", athlete_uuid).maybeSingle();

    // For solo users, create a basic profile if none exists
    let athleteName = "Athlete";
    if (is_solo) {
      const { data: userProfile } = await supabaseClient
        .from("profiles").select("full_name").eq("id", athlete_uuid).maybeSingle();
      athleteName = userProfile?.full_name || "Solo Athlete";
    } else {
      athleteName = athleteProfile?.name || "Unknown";
    }

    // Fetch latest test metrics
    const { data: metrics, error: testError } = await supabaseClient
      .from("athlete_testing").select("*")
      .eq("athlete_uuid", athlete_uuid)
      .order("test_date", { ascending: false }).limit(1);

    const metrics_available = !!(metrics && metrics.length);

    // Compose prompt with solo-specific context
    const systemPrompt = [
      "You are an elite strength & conditioning program generator (ARIA), creating detailed weekly programs.",
      "Output must be valid JSON, strictly matching the provided schema, for import by the Catalyft app.",
      `${is_solo ? 'Solo' : 'Coached'} Athlete: ${athleteName}${metrics_available ? ", with recent test data." : "."}`,
      "Schema: {meta:{goal, weeks, metrics_available},blocks:[{week,sessions:[{day,session_type,exercises:[{name,sets,reps,intensity,rest_sec,notes}]}]}",
      "Instructions: Use modern S&C best practices and periodized block structure. Do NOT include bodyweight-only or rehab content unless specified.",
      is_solo ? "This is for a solo athlete training independently - ensure exercises are safe to perform alone and include proper warm-up/cool-down." : "",
      metrics_available && metrics?.[0] ? `Recent metrics: 1RM (${metrics[0].lift||""}/${metrics[0].one_rm_kg||""}), CMJ (${metrics[0].cmj_cm||""}), Sprint10m (${metrics[0].sprint_10m_s||""})` : ""
    ].filter(Boolean).join("\n");

    const userPrompt = `Goal: ${goal}, Duration: ${weeks} weeks.${is_solo ? ' Solo training program needed.' : ''}`;

    // OpenAI Request
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!openaiRes.ok) throw new Error(`OpenAI error: ${openaiRes.statusText}`);
    const completions = await openaiRes.json();
    let parsed: z.infer<typeof AriaProgramSchema>;
    try {
      parsed = AriaProgramSchema.parse(
        typeof completions.choices[0].message.content === 'string'
          ? JSON.parse(completions.choices[0].message.content)
          : completions.choices[0].message.content
      );
    } catch (e: any) {
      console.error("Zod parse error", e);
      return new Response(JSON.stringify({ error: "Program output did not match expected schema", detail: e.errors }), { status: 400, headers: corsHeaders });
    }

    if (is_solo) {
      // For solo users, use the new solo_create_block RPC
      const { data: blockId, error: blockError } = await supabaseClient
        .rpc('solo_create_block', {
          p_name: `ARIA: ${parsed.meta.goal} (${weeks}wk)`,
          p_duration_weeks: weeks,
          p_block: parsed
        });

      if (blockError) throw blockError;

      return new Response(JSON.stringify({ block_id: blockId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Existing coach workflow
      const { data: tmpl, error: tmplError } = await supabaseClient
        .from("program_templates")
        .insert({
          block_json: parsed, 
          coach_uuid,
          name: `ARIA: ${parsed.meta.goal} (${weeks}wk)`,
          origin: "ARIA"
        })
        .select('id')
        .single();

      if (tmplError) throw tmplError;

      // Generate workout_blocks and sessions for coaches
      for (const block of parsed.blocks ?? []) {
        const { data: wbRow, error: wbError } = await supabaseClient
          .from('workout_blocks')
          .insert({
            athlete_uuid, 
            coach_uuid,
            name: `ARIA: ${parsed.meta.goal} Week ${block.week}`,
            duration_weeks: 1,
            data: block
          })
          .select('id')
          .single();
        if (wbError) throw wbError;

        for (const session of block.sessions ?? []) {
          await supabaseClient.from('sessions').insert({
            coach_uuid,
            athlete_uuid,
            start_ts: null,
            end_ts: null,
            type: session.session_type,
            notes: `ARIA gen: ${session.day} wk${block.week}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      return new Response(JSON.stringify({ template_id: tmpl.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (err: any) {
    console.error("ARIA-GENERATE error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), { status: 500, headers: corsHeaders });
  }
});
