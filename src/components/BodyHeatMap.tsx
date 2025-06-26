
import React, { useState, useMemo } from "react";
import { useMuscleHeatmap } from "@/hooks/useMuscleHeatmap";
import clsx from "clsx";
import { normalizeId } from "./bodyHeatMapUtils";
import { BodyHeatMapDebugPanel } from "./BodyHeatMap/BodyHeatMapDebugPanel";
import { BodyHeatMapOverlays } from "./BodyHeatMap/BodyHeatMapOverlays";
import { BodyHeatMapSVG } from "./BodyHeatMap/BodyHeatMapSVG";
import { useSVGLoader } from "./BodyHeatMap/useSVGLoader";

type MuscleHeatmapEntry = {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
};

interface BodyHeatMapProps {
  athleteId: string;
  window_days?: number;
}

export const BodyHeatMap: React.FC<BodyHeatMapProps> = ({
  athleteId,
  window_days = 7,
}) => {
  const { svg, svgError } = useSVGLoader();
  const { data, isLoading, isError, error } = useMuscleHeatmap(athleteId, window_days);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  // Build lookup: SVG id -> muscle data
  const muscleMap: Record<string, MuscleHeatmapEntry> = useMemo(() => 
    (data || []).reduce((acc, m) => {
      acc[normalizeId(m.muscle)] = m;
      return acc;
    }, {} as Record<string, MuscleHeatmapEntry>)
  , [data]);

  // Memoize unreconcilable muscle IDs
  const unreconcilableIds = useMemo(() => {
    if (!svg) return [];
    const matches = [...svg.matchAll(/id="([a-zA-Z0-9_\-]+)"/g)].map(m => m[1]);
    return matches.filter(id => !muscleMap[normalizeId(id)]);
  }, [svg, muscleMap]);

  return (
    <div
      className={clsx(
        "relative rounded-xl bg-transparent flex items-center justify-center w-full h-full overflow-hidden"
      )}
    >
      <BodyHeatMapDebugPanel
        debugOpen={debugOpen}
        setDebugOpen={setDebugOpen}
        athleteId={athleteId}
        svg={svg}
        svgError={svgError}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data}
        unreconcilableIds={unreconcilableIds}
      />

      <BodyHeatMapSVG
        svg={svg}
        muscleMap={muscleMap}
        hoveredMuscle={hoveredMuscle}
        setHoveredMuscle={setHoveredMuscle}
      />

      <BodyHeatMapOverlays
        svgError={svgError}
        svg={svg}
        isLoading={isLoading}
        isError={isError}
        error={error}
        athleteId={athleteId}
        data={data}
      />
    </div>
  );
};
