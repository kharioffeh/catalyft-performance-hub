
import React, { useEffect, useState, useRef } from "react";
import { useMuscleHeatmap } from "@/hooks/useMuscleHeatmap";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MuscleHeatmapEntry = {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
};

const colorScale = (acwr: number) => {
  if (acwr <= 0.8) return "#22c55e";
  if (acwr <= 1.3) return "#fec15f";
  return "#ef4444";
};

const prettyName = (muscle: string) =>
  muscle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface BodyHeatMapProps {
  athleteId: string;
  window_days?: number;
}

export const BodyHeatMap: React.FC<BodyHeatMapProps> = ({
  athleteId,
  window_days = 7,
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useMuscleHeatmap(athleteId, window_days);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Build lookup: SVG id -> muscle data
  const muscleMap: Record<string, MuscleHeatmapEntry> =
    (data || []).reduce((acc, m) => {
      acc[normalizeId(m.muscle)] = m;
      return acc;
    }, {} as Record<string, MuscleHeatmapEntry>);

  // Track which muscle (svg) user is hovering
  useEffect(() => {
    if (!svg || !wrapperRef.current) return;

    // Parse string -> DOM to attach events
    const container = wrapperRef.current.querySelector("[data-heatmap-svg-wrapper]");
    if (!container) return;
    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    // For each muscle in muscleMap, attach hover events
    Object.keys(muscleMap).forEach((muscleId) => {
      const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
      if (el) {
        el.style.cursor = "pointer";
        el.addEventListener("mouseenter", () => setHoveredMuscle(muscleId));
        el.addEventListener("mouseleave", () => setHoveredMuscle(null));
        // Add a11y label for tooltip
        el.setAttribute("aria-label", prettyName(muscleId));
        el.setAttribute("tabindex", "0");
      }
    });

    // Clean up
    return () => {
      Object.keys(muscleMap).forEach((muscleId) => {
        const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
        if (el) {
          el.removeEventListener("mouseenter", () => setHoveredMuscle(muscleId));
          el.removeEventListener("mouseleave", () => setHoveredMuscle(null));
        }
      });
    };
  }, [svg, muscleMap, wrapperRef.current]);

  useEffect(() => {
    fetch("/heatmap/body.svg")
      .then(r => r.text())
      .then(setSvg)
      .catch(() => setSvg(null));
  }, []);

  // Colorize SVG via string-replace
  let svgWithColors = svg;
  if (svg) {
    svgWithColors = svg.replace(
      /id="([a-zA-Z0-9_\-]+)"/g,
      (full, id: string) => {
        const normId = normalizeId(id);
        const row = muscleMap[normId];
        const color = row ? colorScale(row.acwr) : "#d1d5db";
        return `id="${id}" style="fill:${color};transition:fill 300ms;"`;
      }
    );
  }

  // Find hovered muscle record
  const muscleData =
    hoveredMuscle && muscleMap[normalizeId(hoveredMuscle)] ? muscleMap[normalizeId(hoveredMuscle)] : null;

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        "relative rounded-xl shadow-glass-lg bg-white/10 p-3 sm:p-6 flex items-center justify-center w-full h-full max-h-[36rem] overflow-auto"
      )}
    >
      <TooltipProvider>
        <div
          className="w-full flex justify-center"
          data-heatmap-svg-wrapper
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: svgWithColors || "" }}
        />

        {/* Tooltip */}
        <Tooltip open={!!muscleData}>
          <TooltipTrigger asChild>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 50,
              }}
            />
          </TooltipTrigger>
          {muscleData && (
            <TooltipContent
              side="right"
              className="animate-fade-in min-w-[195px]"
              style={{
                pointerEvents: "auto",
                zIndex: 999,
              }}
            >
              <div className="font-bold text-lg mb-1 capitalize">{prettyName(muscleData.muscle)}</div>
              <div className="flex flex-col gap-1 text-sm">
                <div>
                  Acute: <span className="font-semibold">{muscleData.acute.toFixed(1)}</span>
                </div>
                <div>
                  Chronic: <span className="font-semibold">{muscleData.chronic.toFixed(1)}</span>
                </div>
                <div>
                  ACWR:{" "}
                  <span
                    className={clsx(
                      muscleData.zone === "High" && "text-red-600",
                      muscleData.zone === "Low" && "text-green-500",
                      muscleData.zone === "Normal" && "text-yellow-600"
                    )}
                  >
                    {muscleData.acwr.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-xs">
                  Zone: <span className="font-bold">{muscleData.zone}</span>
                </div>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      {/* Loading/Error Overlay */}
      {!svg && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading SVG...
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading muscle data...
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/30 text-red-600 z-10 rounded-xl">
          Error loading data: {String((error as any)?.message ?? error)}
        </div>
      )}
      {/* No data */}
      {svg && (data && data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-medium bg-black/30 rounded-xl z-10">
          No muscle data found for this athlete.
        </div>
      )}
    </div>
  );
};

/** Helper to normalize id. SVGs may have id="rectus-femoris"; DB uses "rectus_femoris" */
function normalizeId(id: string) {
  return id.replace(/-/g, "_").toLowerCase();
}
