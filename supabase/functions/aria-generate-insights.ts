
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// --- Zod schema, reimplemented here for Edge Runtime ---
const aiInsightSchema = z.object({
  athlete_uuid: z.string().uuid(),
  coach_uuid: z.string().uuid(),
  source_type: z.enum(["readiness", "workout", "chat"]).nullable().optional(),
  json: z.record(z.any()),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: corsHeaders },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: corsHeaders },
    );
  }

  // Validate the body using Zod schema
  const parseResult = aiInsightSchema.safeParse(body);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parseResult.error.flatten() }),
      { status: 400, headers: corsHeaders },
    );
  }

  const { athlete_uuid, coach_uuid, json, source_type } = parseResult.data;

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Attempt to insert the new row
  const { error } = await supabase
    .from("ai_insights")
    .insert([
      {
        athlete_uuid,
        coach_uuid,
        source_type: source_type ?? null,
        json,
      },
    ]);

  if (error) {
    console.error("Supabase insert error", error);
    return new Response(
      JSON.stringify({ error: "Database insert failed", details: error.message }),
      { status: 500, headers: corsHeaders },
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 201, headers: corsHeaders },
  );
});

