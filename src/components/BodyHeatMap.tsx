
import React, { useState, useMemo } from "react";
import { useMuscleHeatmap } from "@/hooks/useMuscleHeatmap";
import clsx from "clsx";
import { normalizeId } from "./bodyHeatMapUtils";
import { BodyHeatMapDebugPanel } from "./BodyHeatMap/BodyHeatMapDebugPanel";
import { BodyHeatMapOverlays } from "./BodyHeatMap/BodyHeatMapOverlays";
import { BodyHeatMapSVG } from "./BodyHeatMap/BodyHeatMapSVG";
import { useSVGLoader } from "./BodyHeatMap/useSVGLoader";

// Updated type to support both data structures
type MuscleHeatmapEntry = {
  muscle: string;
  load?: number; // New load-based structure (0-100)
  acute?: number; // Existing ACWR structure
  chronic?: number;
  acwr?: number;
  zone?: "Low" | "Normal" | "High";
};

interface BodyHeatMapProps {
  userId: string;
  window_days?: number;
  // Optional prop to override data for testing/storybook components
  mockData?: MuscleHeatmapEntry[];
}

export const BodyHeatMap: React.FC<BodyHeatMapProps> = ({
  userId,
  window_days = 7,
  mockData,
}) => {
  const { svg, svgError } = useSVGLoader();
  const { data, isLoading, isError, error } = useMuscleHeatmap(userId, window_days);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  // Use mock data if provided, otherwise use fetched data
  const muscleData = mockData || data;

  // Build lookup: SVG id -> muscle data
  const muscleMap: Record<string, MuscleHeatmapEntry> = useMemo(() => 
    (muscleData || []).reduce((acc, m) => {
      acc[normalizeId(m.muscle)] = m;
      return acc;
    }, {} as Record<string, MuscleHeatmapEntry>)
  , [muscleData]);

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
        athleteId={userId}
        svg={svg}
        svgError={svgError}
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={muscleData}
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
        athleteId={userId}
        data={muscleData}
      />
    </div>
  );
};
