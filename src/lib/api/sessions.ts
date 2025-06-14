
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

/**
 * Creates a new session row in Supabase.
 * The payload should exclude "coach_uuid" as it is looked up based on the authenticated user's email.
 */
export async function createSession(
  payload: Omit<TablesInsert<"sessions">, "coach_uuid" | "created_at" | "updated_at" | "id" | "load" | "rpe">
) {
  // Get the current authenticated user and their email.
  const user = supabase.auth.getUser && (await supabase.auth.getUser()).data.user;
  if (!user?.email) throw new Error("No authenticated user");

  // Look up the coach record by email address.
  const { data: coach, error: coachErr } = await supabase
    .from("coaches")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (coachErr) throw coachErr;
  if (!coach?.id) throw new Error("Coach record not found for this user");

  // Attempt to insert a session with proper typing.
  const { error } = await supabase.from("sessions").insert({
    ...payload,
    coach_uuid: coach.id,
  } as TablesInsert<"sessions">);

  if (error) throw error;
}
