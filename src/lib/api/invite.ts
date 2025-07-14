import { supabase } from "@/lib/supabase";

export interface InviteAthleteData {
  email: string;
  name?: string;
  startDate?: string;
  resend?: boolean;
}

export interface InviteAthleteResponse {
  success: boolean;
  message?: string;
  error?: string;
  hasPendingInvite?: boolean;
  inviteId?: string;
  email?: string;
  resent?: boolean;
}

/**
 * Invites an athlete via the Supabase edge function
 */
export async function inviteAthlete(data: InviteAthleteData): Promise<InviteAthleteResponse> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('You must be logged in to invite athletes');
  }

  const { data: response, error } = await supabase.functions.invoke('invite-athlete', {
    body: {
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim(),
      startDate: data.startDate,
      resend: data.resend || false
    },
    headers: {
      Authorization: `Bearer ${session.session.access_token}`
    }
  });

  if (error) {
    console.error('Invite athlete error:', error);
    throw new Error('Failed to send invite. Please try again.');
  }

  return response as InviteAthleteResponse;
}