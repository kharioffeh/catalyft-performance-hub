
import React from "react";
import clsx from "clsx";
import { prettyName } from "./bodyHeatMapUtils";

type MuscleHeatmapTooltipProps = {
  muscleData: {
    muscle: string;
    acute: number;
    chronic: number;
    acwr: number;
    zone: "Low" | "Normal" | "High";
  };
};

export const MuscleHeatmapTooltip: React.FC<MuscleHeatmapTooltipProps> = ({
  muscleData,
}) => {
  if (!muscleData) return null;
  return (
    <div>
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
    </div>
  );
};
