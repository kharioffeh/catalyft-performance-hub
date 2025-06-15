import React, { useEffect, useState, useRef } from "react";
import { useMuscleHeatmap } from "@/hooks/useMuscleHeatmap";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { colorScale, prettyName, normalizeId } from "./bodyHeatMapUtils";
import { MuscleHeatmapTooltip } from "./MuscleHeatmapTooltip";

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

  // Enhance error extraction for debugging
  const friendlyErrorMessage = () => {
    if (!error) return "";
    // Supabase error object? (best effort)
    if (typeof error === "object" && error !== null) {
      if ("message" in error) return String((error as any).message);
      if ("error" in error) return String((error as any).error);
      try {
        return JSON.stringify(error);
      } catch (e) {
        return String(error);
      }
    }
    return typeof error === "string" ? error : String(error);
  };

  // Memoize unreconcilable muscle IDs
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
        <div className="absolute top-8 right-2 z-[110] bg-zinc-900/90 backdrop-blur px-4 py-3 rounded border border-zinc-700 text-xs text-white/80 max-w-[370px] min-w-[270px]">
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
                ? <span className="text-red-400">error: {friendlyErrorMessage()}</span>
                : Array.isArray(data)
                ? <span className="text-green-500">ok ({data.length} muscles)</span>
                : <span className="text-yellow-200">empty</span>
              }
            </li>
            {isError && (
              <li className="pt-1">
                <span className="text-red-400">Detailed error: {friendlyErrorMessage()}</span>
              </li>
            )}
            <li>
              <strong>Muscle IDs in SVG not mapped:</strong>
              <div className="max-h-20 overflow-y-auto">
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
              <MuscleHeatmapTooltip muscleData={muscleData} />
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Enhanced Loading/Error Overlay */}
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
          <div>
            <b>Error loading muscle data</b>
            <br />
            {friendlyErrorMessage()}
            <br />
            <span className="text-xs text-red-500 font-mono break-words">{typeof error === 'object' ? JSON.stringify(error) : String(error)}</span>
          </div>
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
