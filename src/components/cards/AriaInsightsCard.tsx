
import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Brain, Sparkles } from 'lucide-react';
import { GlassSkeletonText } from '@/components/ui/GlassSkeleton';

const SMART_SUGGESTIONS = [
  "Summarise today's readiness status",
  "What's affecting my recovery?",
  "Any training load concerns?",
  "Sleep quality insights",
  "Recovery recommendations"
] as const;

interface AriaInsightsCardProps {
  data: any;
  loading: boolean;
}

export const AriaInsightsCard: React.FC<AriaInsightsCardProps> = ({ data, loading }) => {
  const [ariaInput, setAriaInput] = useState('');

  const handleChipClick = (suggestion: string) => {
    setAriaInput(suggestion);
    // Focus the textarea after state update
    setTimeout(() => {
      document.getElementById('aria-card-input')?.focus();
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ariaInput.trim()) return;
    
    // TODO: Integrate with ARIA insights API
    setAriaInput('');
  };

  return (
    <GlassCard className="p-6 bg-purple-500/10 border-purple-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
      </div>
      
      {loading ? (
        <GlassSkeletonText lines={3} />
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {data && data.length > 0 ? (
              data.map((insight: any, index: number) => (
                <div key={index} className="text-sm text-white/80">
                  {insight.content || insight.message || 'No insight available'}
                </div>
              ))
            ) : (
              <div className="text-sm text-white/60">No insights available</div>
            )}
          </div>

          {/* Smart Prompt Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SMART_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 rounded-full border border-white/15 transition-colors text-white/80"
                onClick={() => handleChipClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Interactive Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              id="aria-card-input"
              rows={2}
              className="w-full resize-none rounded-lg bg-black/20 p-3 text-sm placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
              placeholder="Ask ARIA about your performance..."
              value={ariaInput}
              onChange={(e) => setAriaInput(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!ariaInput.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-1.5 text-sm font-medium text-white flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Ask
              </button>
            </div>
          </form>
        </>
      )}
    </GlassCard>
  );
};
