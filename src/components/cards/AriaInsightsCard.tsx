
import React from 'react';
import { GlassCard } from '@/components/ui';
import { Brain } from 'lucide-react';

interface AriaInsightsCardProps {
  data: string | null;
  loading?: boolean;
}

export const AriaInsightsCard: React.FC<AriaInsightsCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
      </div>
      {data ? (
        <p className="text-white/80 text-sm leading-relaxed">{data}</p>
      ) : (
        <p className="text-white/60 text-sm italic">
          No insights yet – log a session to see personalised advice.
        </p>
      )}
    </GlassCard>
  );
};
