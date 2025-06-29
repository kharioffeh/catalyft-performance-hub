
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Brain } from 'lucide-react';
import { GlassSkeletonText } from '@/components/ui/GlassSkeleton';

interface AriaInsightsCardProps {
  data: any;
  loading: boolean;
}

export const AriaInsightsCard: React.FC<AriaInsightsCardProps> = ({ data, loading }) => {
  return (
    <GlassCard className="p-6 bg-purple-500/10 border-purple-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
      </div>
      {loading ? (
        <GlassSkeletonText lines={3} />
      ) : (
        <div className="space-y-2">
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
      )}
    </GlassCard>
  );
};
