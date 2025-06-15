
// Edge Function: etl_compute_muscle_load.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 1. Get all recent athlete IDs, last 90d of sessions
  const { data: athletes, error: athErr } = await supabase.from("athletes").select("id");
  if (athErr) return new Response("Error reading athletes", { status: 500, headers: corsHeaders });

  let upserts = [];
  // For each athlete, aggregate muscle load for each muscle
  for (const athlete of athletes) {
    // For each day in last 90d
    const { data: sessionLoads, error: sessionErr } = await supabase.rpc("calc_muscle_load_for_athlete", {
      athlete_id_in: athlete.id
    });
    if (sessionErr) continue;
    // upsert each load into muscle_load_daily
    for (const row of sessionLoads) {
      upserts.push(row);
    }
  }
  
  for (const tuple of upserts) {
    // Upsert muscle_load_daily
    await supabase.from("muscle_load_daily").upsert(tuple, { onConflict: ["athlete_id", "day", "muscle"] })
  }

  return new Response(JSON.stringify({ upserts: upserts.length }), { headers: corsHeaders });
});
