
import { z } from "zod";

export const aiInsightSchema = z.object({
  id: z.string().uuid(),
  athlete_uuid: z.string().uuid(),
  coach_uuid: z.string().uuid(),
  source_type: z.enum(["readiness", "workout", "chat"]).nullable().optional(),
  json: z.record(z.any()),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type AiInsight = z.infer<typeof aiInsightSchema>;
