
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
    <div className={`bg-transparent flex items-center justify-center min-h-[420px] sm:min-h-[460px] ${className || ""}`}>
      <BodyHeatMap athleteId={athleteId} window_days={parseInt(period.replace(/\D/g, "")) || 7} />
    </div>
  );
};
