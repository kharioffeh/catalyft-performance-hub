
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
  return (
    <div className={`bg-transparent rounded-xl shadow-glass-lg bg-white/10 border border-white/20 p-3 ${className || ""}`}>
      <BodyHeatMap 
        userId={athleteId} 
        window_days={parseInt(period.replace(/\D/g, "")) || 7} 
      />
    </div>
  );
};
