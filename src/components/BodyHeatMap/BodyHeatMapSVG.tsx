
import React, { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpring, animated } from '@react-spring/web';
import { colorScale, prettyName, normalizeId } from "../bodyHeatMapUtils";
import { MuscleHeatmapTooltip } from "../MuscleHeatmapTooltip";
import { useReducedMotion } from '@/hooks/useReducedMotion';

type MuscleHeatmapEntry = {
  muscle: string;
  acute: number;
  chronic: number;
  acwr: number;
  zone: "Low" | "Normal" | "High";
};

interface BodyHeatMapSVGProps {
  svg: string | null;
  muscleMap: Record<string, MuscleHeatmapEntry>;
  hoveredMuscle: string | null;
  setHoveredMuscle: (muscle: string | null) => void;
}

export const BodyHeatMapSVG: React.FC<BodyHeatMapSVGProps> = ({
  svg,
  muscleMap,
  hoveredMuscle,
  setHoveredMuscle,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Track which muscle (svg) user is hovering
  useEffect(() => {
    if (!svg || !wrapperRef.current) return;

    const container = wrapperRef.current.querySelector("[data-heatmap-svg-wrapper]");
    if (!container) return;
    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    Object.keys(muscleMap).forEach((muscleId) => {
      const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
      if (el) {
        el.style.cursor = "pointer";
        el.onmouseenter = () => setHoveredMuscle(muscleId);
        el.onmouseleave = () => setHoveredMuscle(null);
        el.setAttribute("aria-label", prettyName(muscleId));
        el.setAttribute("tabindex", "0");

        // Add pulse animation for high-risk muscles (acwr > 1.5)
        const muscleData = muscleMap[normalizeId(muscleId)];
        if (muscleData && muscleData.acwr > 1.5 && !prefersReducedMotion) {
          el.style.transformOrigin = 'center';
          el.style.animation = 'pulse 2s ease-in-out infinite';
        }
      }
    });

    return () => {
      Object.keys(muscleMap).forEach((muscleId) => {
        const el = svgEl.querySelector<SVGElement>(`#${muscleId}`);
        if (el) {
          el.onmouseenter = null;
          el.onmouseleave = null;
          el.style.animation = '';
        }
      });
    };
  }, [svg, muscleMap, setHoveredMuscle, prefersReducedMotion]);

  // Colorize SVG via string-replace with enhanced colors for high-risk muscles
  let svgWithColors = svg;
  if (svg) {
    svgWithColors = svg.replace(
      /id="([a-zA-Z0-9_\-]+)"/g,
      (full, id: string) => {
        const normId = normalizeId(id);
        const row = muscleMap[normId];
        let color = row ? colorScale(row.acwr) : "#d1d5db";
        
        // Enhanced color for high-risk muscles
        if (row && row.acwr > 1.5) {
          color = "#FC7465"; // WCAG-compliant red for high risk
        }
        
        return `id="${id}" style="fill:${color};transition:fill 300ms;"`;
      }
    );
  }

  const muscleData =
    hoveredMuscle && muscleMap[normalizeId(hoveredMuscle)] ? muscleMap[normalizeId(hoveredMuscle)] : null;

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center">
      <TooltipProvider>
        <div
          className="w-full h-full flex items-center justify-center"
          data-heatmap-svg-wrapper
          dangerouslySetInnerHTML={{ __html: svgWithColors || "" }}
        />
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
    </div>
  );
};
