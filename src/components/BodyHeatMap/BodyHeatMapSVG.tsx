
import React, { useEffect, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpring, animated } from '@react-spring/web';
import { colorScale, getLoadColor, prettyName, normalizeId } from "../bodyHeatMapUtils";
import { sanitizeSvg } from '@/lib/security';
import { MuscleHeatmapTooltip } from "../MuscleHeatmapTooltip";
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PulseWrapper } from '@/components/animations/PulseWrapper';

// Updated type to support both data structures
type MuscleHeatmapEntry = {
  muscle: string;
  load?: number; // New load-based structure (0-100)
  acute?: number; // Existing ACWR structure
  chronic?: number;
  acwr?: number;
  zone?: "Low" | "Normal" | "High";
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

  // Get pulse intensity based on load or ACWR value
  const getPulseIntensity = (muscleData: MuscleHeatmapEntry): 'low' | 'medium' | 'high' | null => {
    if (typeof muscleData.load === 'number') {
      // Load-based structure
      if (muscleData.load > 80) return 'high';
      if (muscleData.load > 60) return 'medium';
      if (muscleData.load > 40) return 'low';
      return null;
    } else if (typeof muscleData.acwr === 'number') {
      // ACWR-based structure (existing)
      if (muscleData.acwr > 1.5) return 'high';
      if (muscleData.acwr > 1.3) return 'medium';
      if (muscleData.acwr > 1.1) return 'low';
      return null;
    }
    return null;
  };

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
        const originalOpacity = el.style.opacity || "0.9";

        // Mouse events with hover effects
        el.onmouseenter = () => {
          setHoveredMuscle(muscleId);
          el.style.opacity = "1";
        };
        el.onmouseleave = () => {
          setHoveredMuscle(null);
          el.style.opacity = originalOpacity;
        };
        
        // Touch events for mobile
        el.ontouchstart = (e) => {
          e.preventDefault();
          setHoveredMuscle(muscleId);
        };
        el.ontouchend = (e) => {
          e.preventDefault();
          setTimeout(() => setHoveredMuscle(null), 2000); // Show tooltip for 2 seconds on touch
        };
        
        // Click event for accessibility
        el.onclick = () => {
          setHoveredMuscle(hoveredMuscle === muscleId ? null : muscleId);
        };
        
        el.setAttribute("aria-label", prettyName(muscleId));
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");

        // Enhanced pulse animation based on risk level
        const muscleData = muscleMap[normalizeId(muscleId)];
        if (muscleData && !prefersReducedMotion) {
          const pulseIntensity = getPulseIntensity(muscleData);
          if (pulseIntensity) {
            el.style.transformOrigin = 'center';
            
            // Different animation styles based on intensity
            switch (pulseIntensity) {
              case 'high':
                el.style.animation = 'pulse 1s ease-in-out infinite';
                break;
              case 'medium':
                el.style.animation = 'pulse 1.5s ease-in-out infinite';
                break;
              case 'low':
                el.style.animation = 'pulse 2s ease-in-out infinite';
                break;
            }
          }
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

  // Colorize SVG via string-replace with HSL colors for load or enhanced colors for ACWR
  let svgWithColors = svg;
  if (svg) {
    svgWithColors = svg.replace(
      /id="([a-zA-Z0-9_\-]+)"/g,
      (full, id: string) => {
        const normId = normalizeId(id);
        const row = muscleMap[normId];
        let color = "#d1d5db"; // Default gray
        let opacity = "0.8";
        
        if (row) {
          if (typeof row.load === 'number') {
            // Use new load-based coloring with HSL
            color = getLoadColor(row.load);
            opacity = "0.9";
          } else if (typeof row.acwr === 'number') {
            // Use existing ACWR-based coloring
            color = colorScale(row.acwr);
            opacity = "0.9";

            // Enhanced color for high-risk muscles with better contrast
            if (row.acwr > 1.5) {
              color = "#DC2626"; // Stronger red for high risk
            } else if (row.acwr > 1.3) {
              color = "#EA580C"; // Orange for medium risk
            }
          }
        }

        // Only use CSS styles (no inline JS handlers to avoid XSS and DOMPurify stripping)
        // Hover effects are handled via useEffect event listeners
        return `id="${id}" style="fill:${color};opacity:${opacity};transition:all 300ms ease-out;cursor:pointer;"`;
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
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgWithColors || "") }}
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
