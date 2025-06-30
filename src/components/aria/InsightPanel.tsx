
import React from 'react';
import { Brain } from 'lucide-react';

interface InsightPanelProps {
  insights: string[];
  suggestions: string[];
  onPrompt: (q: string) => void;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  insights,
  suggestions,
  onPrompt
}) => {
  return (
    <div className="rounded-xl bg-gradient-to-r from-purple-500/30 to-emerald-500/20 p-[1px]">
      <div className="rounded-xl bg-black/40 backdrop-blur-md p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
          <h3 className="text-sm md:text-base font-semibold text-white">ARIA Insights</h3>
        </div>

        {/* Insights bullet list */}
        {insights.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 mb-3 md:mb-4 text-sm md:text-base text-white/90">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm md:text-base text-white/60 mb-3 md:mb-4">
            No insights available yet
          </p>
        )}

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onPrompt(suggestion)}
              className="rounded-full bg-white/5 hover:bg-white/10 transition-colors text-xs px-3 py-1 text-white/80 border border-white/10"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
