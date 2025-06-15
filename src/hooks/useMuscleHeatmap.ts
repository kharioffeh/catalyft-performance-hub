
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MuscleHeatmapRow {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
}

export function useMuscleHeatmap(athleteId: string, window_days = 7) {
  return useQuery<MuscleHeatmapRow[]>({
    queryKey: ["muscleHeatmap", athleteId, window_days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_muscle_heatmap", {
        athlete_id_in: athleteId,
        window_days,
      });
      if (error) throw error;
      return (data ?? []) as MuscleHeatmapRow[];
    },
    enabled: !!athleteId,
  });
}
