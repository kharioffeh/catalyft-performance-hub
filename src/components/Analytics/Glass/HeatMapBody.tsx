
import React from "react";
import { BodyHeatMap } from "@/components/BodyHeatMap";

interface HeatMapBodyProps {
  className?: string;
  period: string;
  athleteId?: string;
}

export const HeatMapBody: React.FC<HeatMapBodyProps> = ({
  className,
  period,
  athleteId = "",
}) => {
  // Ensure athleteId from parent (Analytics) is used
  return (
    <div className={className}>
      <h3 className="text-white font-medium mb-4">Training Muscle Heat Map</h3>
      <BodyHeatMap athleteId={athleteId} window_days={parseInt(period.replace(/\D/g, "")) || 7} />
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-white/70">Low ACWR (&lt;0.8)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-white/70">Normal (0.8–1.3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-white/70">High (&gt;1.3)</span>
        </div>
      </div>
    </div>
  );
};
