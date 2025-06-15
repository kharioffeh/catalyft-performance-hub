import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Zod schema (short version, keep full in src)
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
    const { athlete_uuid, coach_uuid, goal, weeks } = input;

    if (!athlete_uuid || !coach_uuid || !goal || !weeks)
      return new Response(JSON.stringify({ error: "Missing required params" }), { status: 400, headers: corsHeaders });

    // Fetch athlete profile
    const { data: athleteProfile, error: profileError } = await supabaseClient
      .from("athletes").select("id, name").eq("id", athlete_uuid).maybeSingle();

    // Fetch latest test metrics
    const { data: metrics, error: testError } = await supabaseClient
      .from("athlete_testing").select("*")
      .eq("athlete_uuid", athlete_uuid)
      .order("test_date", { ascending: false }).limit(1);

    const metrics_available = !!(metrics && metrics.length);

    // Compose prompt
    const systemPrompt = [
      "You are an elite strength & conditioning program generator (ARIA), creating detailed weekly programs.",
      "Output must be valid JSON, strictly matching the provided schema, for import by the Catalyft app.",
      `Athlete: ${athleteProfile?.name||"Unknown"}${metrics_available ? ", with recent test data." : "."}`,
      "Schema: {meta:{goal, weeks, metrics_available},blocks:[{week,sessions:[{day,session_type,exercises:[{name,sets,reps,intensity,rest_sec,notes}]}]}",
      "Instructions: Use modern S&C best practices and periodized block structure. Do NOT include bodyweight-only or rehab content unless specified.",
      metrics_available && metrics?.[0] ? `Recent metrics: 1RM (${metrics[0].lift||""}/${metrics[0].one_rm_kg||""}), CMJ (${metrics[0].cmj_cm||""}), Sprint10m (${metrics[0].sprint_10m_s||""})` : ""
    ].filter(Boolean).join("\n");

    const userPrompt = `Goal: ${goal}, Duration: ${weeks} weeks.`;

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

    // Insert into program_templates
    const { data: tmpl, error: tmplError } = await supabaseClient
      .from("program_templates") // needs block_json, coach_uuid, name, origin
      .insert({
        block_json: parsed, 
        coach_uuid,
        name: `ARIA: ${parsed.meta.goal} (${weeks}wk)`,
        origin: "ARIA"
      })
      .select('id')
      .single();

    if (tmplError) throw tmplError;

    // Also generate workout_blocks and sessions. Simplified: iterate program, write block for each week.
    for (const block of parsed.blocks ?? []) {
      // Insert a workout_block per week
      const { data: wbRow, error: wbError } = await supabaseClient
        .from('workout_blocks')
        .insert({
          athlete_uuid, data: block
        })
        .select('id')
        .single();
      if (wbError) throw wbError;

      // For each session in the week, insert session
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
  } catch (err: any) {
    console.error("ARIA-GENERATE error:", err);
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), { status: 500, headers: corsHeaders });
  }
});
