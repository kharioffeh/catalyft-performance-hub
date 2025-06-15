
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MuscleHeatmapRow {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
}

/**
 * This hook fetches muscle heatmap data from Supabase's 'get_muscle_heatmap' RPC function.
 * The function returns a single JSONB array, not an array of rows.
 */
export function useMuscleHeatmap(athleteId: string, window_days = 7) {
  return useQuery<MuscleHeatmapRow[]>({
    queryKey: ["muscleHeatmap", athleteId, window_days],
    queryFn: async () => {
      // Run the Supabase RPC which returns a single JSONB, not a set of rows.
      const { data, error } = await (supabase as any).rpc("get_muscle_heatmap", {
        athlete_id_in: athleteId,
        window_days,
      });

      if (error) throw error;

      // The result is an array of objects in a single key, not raw rows
      // data might be [{ ...records... }] or just { ... }
      if (Array.isArray(data)) {
        // Defensive: should only have one value which is the array
        if (typeof data[0] === "object" && data[0] !== null && Array.isArray(data[0])) {
          return data[0] as MuscleHeatmapRow[];
        }
        // Many environments: Supabase js returns array of objects, e.g. [ { ... }, { ... } ]
        return data as MuscleHeatmapRow[];
      } else if (typeof data === "object" && data !== null && Array.isArray(data)) {
        return data as MuscleHeatmapRow[];
      } else if (typeof data === "object" && data !== null && Array.isArray(data.data)) {
        // Sometimes supabase auto-parses .data property
        return data.data as MuscleHeatmapRow[];
      } else if (Array.isArray(data?.data)) {
        return data.data as MuscleHeatmapRow[];
      } else if (typeof data === "string") {
        // If it's a string/JSONB blob, parse it
        try {
          return JSON.parse(data) as MuscleHeatmapRow[];
        } catch (e) {
          return [];
        }
      }
      return [];
    },
    enabled: !!athleteId,
  });
}
