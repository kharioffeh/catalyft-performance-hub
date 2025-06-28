
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserData {
  id: string;
  email: string;
  full_name: string;
  timezone: string;
  notification_prefs: {
    daily_summary: boolean;
    missed_workout: boolean;
    abnormal_readiness: boolean;
  };
  thresholds: {
    readiness_threshold: number;
    strain_threshold: number;
  };
}

serve(async (req) => {
  try {
    console.log("Starting ARIA reminder scheduler...");

    const now = new Date();
    console.log(`Current time: ${now.toISOString()}`);

    // Get all active users with their preferences and thresholds
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        timezone,
        notification_prefs,
        notification_thresholds (
          readiness_threshold,
          strain_threshold
        )
      `)
      .not("timezone", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users with timezone data found");
      return new Response("No users to process", { status: 200 });
    }

    console.log(`Processing ${users.length} users`);

    // Process each user
    for (const user of users) {
      try {
        const userData: UserData = {
          id: user.id,
          email: user.email,
          full_name: user.full_name || "User",
          timezone: user.timezone || "UTC",
          notification_prefs: user.notification_prefs || {
            daily_summary: true,
            missed_workout: true,
            abnormal_readiness: true
          },
          thresholds: user.notification_thresholds?.[0] || {
            readiness_threshold: 40,
            strain_threshold: 18
          }
        };

        await processUserNotifications(userData, now);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    return new Response("Reminder scheduler completed", { status: 200 });
  } catch (error) {
    console.error("Error in reminder scheduler:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

async function processUserNotifications(user: UserData, now: Date) {
  // Convert current time to user's timezone
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: user.timezone }));
  const hour = userTime.getHours();
  const minute = userTime.getMinutes();

  console.log(`Processing ${user.full_name} (${user.timezone}): ${hour}:${minute.toString().padStart(2, '0')}`);

  // Check for daily summary (6:00 AM local time, ±15 minutes)
  if (user.notification_prefs.daily_summary && hour === 6 && minute < 15) {
    await sendDailySummary(user);
  }

  // Check for missed workouts (any time)
  if (user.notification_prefs.missed_workout) {
    await checkMissedWorkouts(user, now);
  }

  // Check for abnormal readiness (any time)
  if (user.notification_prefs.abnormal_readiness) {
    await checkAbnormalReadiness(user);
  }
}

async function sendDailySummary(user: UserData) {
  try {
    // Check if daily summary already sent today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingNotification } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "daily_summary")
      .gte("created_at", `${today}T00:00:00Z`)
      .single();

    if (existingNotification) {
      console.log(`Daily summary already sent to ${user.full_name}`);
      return;
    }

    // Get user's latest metrics
    const { data: readiness } = await supabase
      .from("vw_readiness_rolling")
      .select("readiness_score, avg_7d")
      .eq("athlete_uuid", user.id)
      .order("day", { ascending: false })
      .limit(1)
      .single();

    const { data: sessions } = await supabase
      .from("sessions")
      .select("type, start_ts")
      .eq("athlete_uuid", user.id)
      .gte("start_ts", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("start_ts", { ascending: false });

    const summary = generateDailySummary(user, readiness, sessions || []);

    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "daily_summary",
        title: "Good Morning! Your Daily Summary",
        body: summary,
        meta: {
          timezone: user.timezone,
          readiness: readiness?.readiness_score,
          sessions_this_week: sessions?.length || 0
        }
      });

    console.log(`Daily summary sent to ${user.full_name}`);
  } catch (error) {
    console.error(`Error sending daily summary to ${user.full_name}:`, error);
  }
}

async function checkMissedWorkouts(user: UserData, now: Date) {
  try {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Find planned sessions that should have started over an hour ago but haven't been completed
    const { data: missedSessions } = await supabase
      .from("sessions")
      .select("id, type, planned_start")
      .eq("athlete_uuid", user.id)
      .eq("status", "planned")
      .not("planned_start", "is", null)
      .lt("planned_start", oneHourAgo.toISOString());

    if (!missedSessions || missedSessions.length === 0) {
      return;
    }

    for (const session of missedSessions) {
      // Check if we already sent a notification for this missed session
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "missed_workout")
        .eq("meta->>session_id", session.id)
        .single();

      if (existingNotification) {
        continue;
      }

      const plannedTime = new Date(session.planned_start).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: user.timezone
      });

      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "missed_workout",
          title: "Missed Workout Reminder",
          body: `You had a ${session.type} session planned for ${plannedTime}. It's not too late to get moving! 💪`,
          meta: {
            session_id: session.id,
            session_type: session.type,
            planned_time: session.planned_start,
            timezone: user.timezone
          }
        });

      console.log(`Missed workout notification sent to ${user.full_name}`);
    }
  } catch (error) {
    console.error(`Error checking missed workouts for ${user.full_name}:`, error);
  }
}

async function checkAbnormalReadiness(user: UserData) {
  try {
    // Get latest readiness score
    const { data: readiness } = await supabase
      .from("vw_readiness_rolling")
      .select("readiness_score, day")
      .eq("athlete_uuid", user.id)
      .order("day", { ascending: false })
      .limit(1)
      .single();

    if (!readiness || readiness.readiness_score === null) {
      return;
    }

    const score = readiness.readiness_score;
    const isLowReadiness = score < user.thresholds.readiness_threshold;

    if (!isLowReadiness) {
      return;
    }

    // Check if we already sent an abnormal readiness notification today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingNotification } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "abnormal_readiness")
      .gte("created_at", `${today}T00:00:00Z`)
      .single();

    if (existingNotification) {
      return;
    }

    const message = score < 30 
      ? `Your readiness is very low (${Math.round(score)}%). Consider taking a rest day or doing light recovery work.`
      : `Your readiness is below your threshold (${Math.round(score)}%). You might want to adjust today's training intensity.`;

    await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "abnormal_readiness",
        title: "Low Readiness Alert",
        body: message,
        meta: {
          readiness_score: score,
          threshold: user.thresholds.readiness_threshold,
          severity: score < 30 ? "high" : "medium",
          timezone: user.timezone
        }
      });

    console.log(`Abnormal readiness notification sent to ${user.full_name} (score: ${score})`);
  } catch (error) {
    console.error(`Error checking abnormal readiness for ${user.full_name}:`, error);
  }
}

function generateDailySummary(user: UserData, readiness: any, sessions: any[]): string {
  const readinessScore = readiness?.readiness_score ? Math.round(readiness.readiness_score) : null;
  const weeklyAvg = readiness?.avg_7d ? Math.round(readiness.avg_7d) : null;
  const recentSessions = sessions.length;

  let summary = `Good morning, ${user.full_name}! 🌅\n\n`;

  if (readinessScore !== null) {
    if (readinessScore >= 80) {
      summary += `🟢 Excellent readiness (${readinessScore}%) - you're primed for high-intensity training!\n`;
    } else if (readinessScore >= 60) {
      summary += `🟡 Moderate readiness (${readinessScore}%) - consider moderate intensity training.\n`;
    } else {
      summary += `🔴 Low readiness (${readinessScore}%) - prioritize recovery and light movement.\n`;
    }

    if (weeklyAvg) {
      const trend = readinessScore > weeklyAvg ? "↗️ improving" : readinessScore < weeklyAvg ? "↘️ declining" : "→ stable";
      summary += `Your 7-day average is ${weeklyAvg}% (${trend})\n\n`;
    }
  }

  if (recentSessions > 0) {
    summary += `📊 You've completed ${recentSessions} session${recentSessions > 1 ? 's' : ''} this week.\n`;
  } else {
    summary += `📊 No sessions logged this week - consider adding some movement to your day!\n`;
  }

  summary += `\nHave a great training day! 💪`;

  return summary;
}
