
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
  const [svgError, setSvgError] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useMuscleHeatmap(athleteId, window_days);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debug/diagnostics info
  const [debugOpen, setDebugOpen] = useState(false);

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

    Object.keys(muscleMap).forEach((muscleId) => {
      const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
      if (el) {
        el.style.cursor = "pointer";
        // Remove previous listeners (ensure no leaks on re-render)
        el.onmouseenter = () => setHoveredMuscle(muscleId);
        el.onmouseleave = () => setHoveredMuscle(null);
        el.setAttribute("aria-label", prettyName(muscleId));
        el.setAttribute("tabindex", "0");
      }
    });

    // Clean up: remove listeners explicitly
    return () => {
      Object.keys(muscleMap).forEach((muscleId) => {
        const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
        if (el) {
          el.onmouseenter = null;
          el.onmouseleave = null;
        }
      });
    };
  }, [svg, muscleMap, wrapperRef.current]);

  // Fetch SVG file (try both front + no-suffix for dev support)
  useEffect(() => {
    setSvgError(null);
    setSvg(null);
    // Try preferred "body.svg", fall back to "body_front.svg" if not found
    fetch("/heatmap/body.svg")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.text();
      })
      .then(setSvg)
      .catch(() => {
        // Try common fallback name
        fetch("/heatmap/body_front.svg")
          .then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.text();
          })
          .then(setSvg)
          .catch((err) => {
            setSvgError("Could not load SVG anatomy diagram from /heatmap/body.svg or /heatmap/body_front.svg. " +
              "Make sure the file exists in the public/heatmap folder and your server is running.");
            setSvg(null);
          });
      });
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

  // UI: Debug info
  const unreconcilableIds = React.useMemo(() => {
    if (!svg) return [];
    // Find all ids in SVG
    const matches = [...svg.matchAll(/id="([a-zA-Z0-9_\-]+)"/g)].map(m => m[1]);
    // Which ones have no matching muscle data?
    return matches.filter(id => !muscleMap[normalizeId(id)]);
  }, [svg, muscleMap]);

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        "relative rounded-xl shadow-glass-lg bg-white/10 p-3 sm:p-6 flex items-center justify-center w-full h-full max-h-[36rem] overflow-auto"
      )}
    >
      {/* Debug Mode Toggle */}
      <button
        className="absolute top-2 right-2 bg-white/10 text-xs px-2 py-1 rounded hover:bg-white/20 z-[101]"
        onClick={() => setDebugOpen((x) => !x)}
        title="Show/hide debug info"
        type="button"
      >
        &#9881; Debug
      </button>
      {/* Debug Panel */}
      {debugOpen && (
        <div className="absolute top-8 right-2 z-[110] bg-zinc-900/90 backdrop-blur px-4 py-3 rounded border border-zinc-700 text-xs text-white/80 max-w-[350px]">
          <div className="font-bold mb-2">BodyHeatMap Debug</div>
          <ul className="space-y-1">
            <li>
              <strong>athleteId:</strong>{" "}
              <span className={athleteId ? "text-green-500" : "text-red-400"}>
                {athleteId ? athleteId : "(none selected)"}
              </span>
            </li>
            <li>
              <strong>SVG loaded:</strong>{" "}
              {svg
                ? "yes"
                : svgError
                ? (
                  <span className="text-red-400">No – {svgError}</span>
                )
                : "no"}
            </li>
            <li>
              <strong>DB Data loaded:</strong> {isLoading
                ? <span className="text-yellow-400">loading…</span>
                : isError
                ? <span className="text-red-400">error: {String(error)}</span>
                : Array.isArray(data)
                ? <span className="text-green-500">ok ({data.length} muscles)</span>
                : <span className="text-yellow-200">empty</span>
              }
            </li>
            <li>
              <strong>Muscle IDs in SVG not mapped:</strong>
              <div className="max-h-16 overflow-y-auto">
                {unreconcilableIds.length === 0
                  ? <span className="text-green-400">none 🎉</span>
                  : <div className="text-yellow-200">{unreconcilableIds.join(", ")}</div>
                }
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Render: SVG */}
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
      {svgError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/50 rounded-xl z-10 text-center px-6">
          <div>
            <b>SVG file could not be loaded.</b>
            <br />
            {svgError}
          </div>
        </div>
      )}
      {(!svg && !svgError) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading SVG anatomy diagram…
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading muscle data…
        </div>
      )}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/30 text-red-600 z-10 rounded-xl text-center px-6">
          Error loading muscle data: {String((error as any)?.message ?? error)}
        </div>
      )}
      {/* Explicit: No athlete selected */}
      {!athleteId && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-medium bg-black/40 rounded-xl z-10 px-6">
          Please select an athlete above to show their training muscle heatmap.
        </div>
      )}
      {/* No muscle data */}
      {svg && (Array.isArray(data) && data.length === 0) && athleteId && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-medium bg-black/30 rounded-xl z-10 text-center px-6">
          No muscle load data was found for this athlete and period.
        </div>
      )}
    </div>
  );
};

/** Helper to normalize id. SVGs may have id="rectus-femoris"; DB uses "rectus_femoris" */
function normalizeId(id: string) {
  return id.replace(/-/g, "_").toLowerCase();
}

