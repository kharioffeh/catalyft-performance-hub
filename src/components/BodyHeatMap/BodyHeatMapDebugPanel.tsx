
import React from "react";

interface DebugPanelProps {
  debugOpen: boolean;
  setDebugOpen: (open: boolean) => void;
  athleteId: string;
  svg: string | null;
  svgError: string | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
  data: any[] | null;
  unreconcilableIds: string[];
}

export const BodyHeatMapDebugPanel: React.FC<DebugPanelProps> = ({
  debugOpen,
  setDebugOpen,
  athleteId,
  svg,
  svgError,
  isLoading,
  isError,
  error,
  data,
  unreconcilableIds,
}) => {
  const friendlyErrorMessage = () => {
    if (!error) return "";
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

  const hasDataArray = data !== null && Array.isArray(data);

  return (
    <>
      {/* Debug Mode Toggle */}
      <button
        className="absolute top-2 right-2 bg-white/10 text-xs px-2 py-1 rounded hover:bg-white/20 z-[101] text-white/70"
        onClick={() => setDebugOpen(!debugOpen)}
        title="Show/hide debug info"
        type="button"
      >
        &#9881;
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
                : hasDataArray
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
    </>
  );
};
