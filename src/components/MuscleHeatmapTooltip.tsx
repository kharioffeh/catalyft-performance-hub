
import React from "react";
import clsx from "clsx";
import { prettyName } from "./bodyHeatMapUtils";

// Updated type to support both data structures
type MuscleHeatmapTooltipProps = {
  muscleData: {
    muscle: string;
    load?: number; // New load-based structure (0-100)
    acute?: number; // Existing ACWR structure
    chronic?: number;
    acwr?: number;
    zone?: "Low" | "Normal" | "High";
  };
};

export const MuscleHeatmapTooltip: React.FC<MuscleHeatmapTooltipProps> = ({
  muscleData,
}) => {
  if (!muscleData) return null;

  // Check if this is the new load-based structure
  const isLoadBased = typeof muscleData.load === 'number';

  return (
    <div>
      <div className="font-bold text-lg mb-1 capitalize">{prettyName(muscleData.muscle)}</div>
      <div className="flex flex-col gap-1 text-sm">
        {isLoadBased ? (
          // New load-based tooltip
          <>
            <div>
              Load: <span className="font-semibold">{muscleData.load}%</span>
            </div>
            <div className="mt-1 text-xs">
              Intensity: <span className={clsx(
                "font-bold",
                muscleData.load! >= 80 && "text-red-600",
                muscleData.load! >= 50 && muscleData.load! < 80 && "text-yellow-600",
                muscleData.load! < 50 && "text-green-500"
              )}>
                {muscleData.load! >= 80 ? "High" : muscleData.load! >= 50 ? "Medium" : "Low"}
              </span>
            </div>
          </>
        ) : (
          // Existing ACWR-based tooltip
          <>
            <div>
              Acute: <span className="font-semibold">{muscleData.acute?.toFixed(1)}</span>
            </div>
            <div>
              Chronic: <span className="font-semibold">{muscleData.chronic?.toFixed(1)}</span>
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
                {muscleData.acwr?.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 text-xs">
              Zone: <span className="font-bold">{muscleData.zone}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
