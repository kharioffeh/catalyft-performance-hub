
import React from "react";

interface OverlaysProps {
  svgError: string | null;
  svg: string | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  athleteId: string;
  data: unknown[] | null;
}

export const BodyHeatMapOverlays: React.FC<OverlaysProps> = ({
  svgError,
  svg,
  isLoading,
  isError,
  error,
  athleteId,
  data,
}) => {
  const friendlyErrorMessage = () => {
    if (!error) return "";
    if (typeof error === "object" && error !== null) {
      const errObj = error as Record<string, unknown>;
      if ("message" in errObj) return String(errObj.message);
      if ("error" in errObj) return String(errObj.error);
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    }
    return typeof error === "string" ? error : String(error);
  };

  return (
    <>
      {/* SVG Error Overlay */}
      {svgError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/50 rounded-xl z-10 text-center px-6">
          <div>
            <b>SVG file could not be loaded.</b>
            <br />
            {svgError}
          </div>
        </div>
      )}

      {/* SVG Loading Overlay */}
      {(!svg && !svgError) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading SVG anatomy diagram…
        </div>
      )}

      {/* Data Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black/30 rounded-xl z-10">
          Loading muscle data…
        </div>
      )}

      {/* Data Error Overlay */}
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

      {/* No Athlete Selected Overlay */}
      {!athleteId && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-medium bg-black/40 rounded-xl z-10 px-6">
          Please select an athlete above to show their training muscle heatmap.
        </div>
      )}

      {/* No Data Overlay */}
      {svg && (Array.isArray(data) && data.length === 0) && athleteId && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 font-medium bg-black/30 rounded-xl z-10 text-center px-6">
          No muscle load data was found for this athlete and period.
        </div>
      )}
    </>
  );
};
