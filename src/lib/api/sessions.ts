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

/**
 * Updates a session's status and timestamps.
 */
export async function updateSessionStatus(
  sessionId: string, 
  status: 'planned' | 'active' | 'completed',
  timestamp?: string
) {
  const updateData: any = { status };
  
  if (status === 'active' && timestamp) {
    updateData.start_ts = timestamp;
  } else if (status === 'completed' && timestamp) {
    updateData.end_ts = timestamp;
  }

  const { error } = await supabase
    .from("sessions")
    .update(updateData)
    .eq("id", sessionId);

  if (error) throw error;
}

/**
 * Reschedules a session to a new date.
 */
export async function rescheduleSession(sessionId: string, newDate: Date) {
  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("start_ts, end_ts")
    .eq("id", sessionId)
    .single();

  if (fetchError) throw fetchError;

  // Calculate duration from original session
  const originalStart = new Date(session.start_ts);
  const originalEnd = new Date(session.end_ts);
  const duration = originalEnd.getTime() - originalStart.getTime();

  // Create new start and end times on the new date, preserving the original time
  const newStart = new Date(newDate);
  newStart.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds());
  
  const newEnd = new Date(newStart.getTime() + duration);

  const { error } = await supabase
    .from("sessions")
    .update({
      start_ts: newStart.toISOString(),
      end_ts: newEnd.toISOString(),
    })
    .eq("id", sessionId);

  if (error) throw error;
}