
import React, { useEffect, useState } from "react";
import { Popover } from "@headlessui/react";
import { useMuscleHeatmap } from "@/hooks/useMuscleHeatmap";
import clsx from "clsx";

type MuscleHeatmapEntry = {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
};

const colorScale = (acwr: number) => {
  // Rd-Yl-Gn scale, clamped
  // 0.8 (green), 1.05 (yellow), 1.3 (red)
  if (acwr <= 0.8) return "#22c55e";
  if (acwr <= 1.05) return "#fec15f";
  if (acwr <= 1.3) return "#ef4444";
  return "#ef4444";
};

const zoneLabel = (acwr: number) => {
  if (acwr < 0.8) return "Low";
  if (acwr <= 1.3) return "Normal";
  return "High";
};

export const BodyHeatMap: React.FC<{ athleteId: string; window_days?: number }> = ({
  athleteId,
  window_days = 7,
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const { data, isLoading } = useMuscleHeatmap(athleteId, window_days);

  // Map muscle names for the SVG IDs, e.g. "rectus_femoris" → "RectusFemoris"
  const muscleMap: Record<string, MuscleHeatmapEntry> =
    (data || []).reduce((acc, m) => {
      acc[m.muscle] = m;
      return acc;
    }, {} as Record<string, MuscleHeatmapEntry>);

  useEffect(() => {
    fetch("/heatmap/body.svg")
      .then(r => r.text())
      .then(setSvg);
  }, []);

  if (!svg) return <div>Loading...</div>;
  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  // Only support rendering if SVG is loaded
  const wrapperClass =
    "relative rounded-xl shadow-glass-lg bg-white/10 p-6 flex items-center justify-center w-full h-full max-h-[36rem] overflow-auto";

  // Parse the SVG to inject fills
  // Here, assume each muscle path has id=muscle (e.g. id="rectus_femoris")
  const svgWithColors = svg.replace(
    /id="([a-z0-9_]+)"/g,
    (full, id: string) => {
      const row = muscleMap[id];
      const color = row ? colorScale(row.acwr) : "#d1d5db"; // default neutral
      return `id="${id}" style="fill:${color};transition:fill 400ms ease;"`;
    }
  );

  // For tooltip, overlay invisible rects if not already interactive in SVG
  return (
    <div className={wrapperClass}>
      <div
        className="w-full flex justify-center"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: svgWithColors }}
      />
      <div className="absolute inset-0 pointer-events-none">
        {(data || []).map((row) => (
          <Popover key={row.muscle} className="pointer-events-auto">
            {({ open }) => (
              <>
                <Popover.Button
                  as="div"
                  className={clsx(
                    "absolute z-10",
                    // Place based on SVG region if possible
                    getMuscleHoverRegion(row.muscle) // implement mapping
                  )}
                  style={{ cursor: "pointer" }}
                />
                <Popover.Panel className="absolute z-20 bg-white/90 rounded-lg shadow-lg p-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="font-bold text-lg mb-2 capitalize">{row.muscle.replace(/_/g, " ")}</div>
                  <div className="flex gap-3 text-sm">
                    <div>Acute: <span className="font-semibold">{row.acute.toFixed(1)}</span></div>
                    <div>Chronic: <span className="font-semibold">{row.chronic.toFixed(1)}</span></div>
                    <div>ACWR: <span className={clsx(
                      row.zone === "High" && "text-red-600",
                      row.zone === "Low" && "text-gray-600",
                      row.zone === "Normal" && "text-yellow-600"
                    )}>{row.acwr.toFixed(2)}</span></div>
                  </div>
                  <div className="mt-2 text-xs">Zone: <span className="font-bold">{row.zone}</span></div>
                </Popover.Panel>
              </>
            )}
          </Popover>
        ))}
      </div>
    </div>
  );
};

// Dummy function for illustration, to be adjusted to your SVG region mapping
function getMuscleHoverRegion(muscle: string): string {
  // You'd want to return absolute positioning here for each SVG id.
  // For now, just put nothing for layout.
  return "";
}
