import { z } from "zod";
export const AriaProgramSchema = z.object({
    meta: z.object({
        goal: z.enum(['max_strength', 'hypertrophy', 'speed_power', 'in-season_maint']),
        weeks: z.number().int().min(2).max(12),
        metrics_available: z.boolean()
    }),
    blocks: z.array(z.object({
        week: z.number().int(),
        sessions: z.array(z.object({
            day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
            session_type: z.enum(['strength', 'conditioning', 'recovery']),
            exercises: z.array(z.object({
                name: z.string(),
                sets: z.number().int().min(1),
                reps: z.number().int().min(1),
                intensity: z.string(),
                rest_sec: z.number().int().min(30),
                notes: z.string().optional()
            }))
        }))
    }))
});
