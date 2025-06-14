
import { supabase } from "@/integrations/supabase/client";

export async function createSession(payload: Omit<SessionInsert, "coach_uuid">) {
  // get coach id based on email
  const user = supabase.auth.getUser && (await supabase.auth.getUser()).data.user;
  if (!user?.email) throw new Error("No authenticated user");
  const { data: coach, error: coachErr } = await supabase
    .from("coaches")
    .select("id")
    .eq("email", user.email)
    .single();
  if (coachErr) throw coachErr;

  const { error } = await supabase.from("sessions").insert({
    ...payload,
    coach_uuid: coach.id,
  });
  if (error) throw error;
}
