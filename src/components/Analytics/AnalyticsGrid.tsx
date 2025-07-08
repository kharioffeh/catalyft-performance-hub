
import React from 'react';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { StressGauge } from '@/components/Dashboard/StressGauge';
import { InsightPanel } from '@/components/aria/InsightPanel';
import { usePeriod } from '@/lib/hooks/usePeriod';

interface AnalyticsGridProps {
  selectedAthleteId: string;
  insights: readonly string[];
  suggestions: readonly string[];
  onPrompt: (suggestion: string) => void;
}

export const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({
  selectedAthleteId,
  insights,
  suggestions,
  onPrompt
}) => {
  const { period } = usePeriod();

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-min">
      {/* Muscle HeatMap - 58% width on desktop, full width on mobile */}
      <div className="col-span-12 lg:col-span-7">
        <div className="aspect-video md:aspect-auto">
          <HeatMapBody 
            className="w-full h-full min-h-[380px] md:h-[420px]" 
            period={period} 
            athleteId={selectedAthleteId} 
          />
        </div>
      </div>
      
      {/* Stress Gauge - 42% width on desktop, full width on mobile */}
      <div className="col-span-12 lg:col-span-5">
        <div className="aspect-video md:aspect-auto flex items-center justify-center">
          <div className="w-full max-w-[280px]">
            <StressGauge value={45} size="large" />
          </div>
        </div>
      </div>

      {/* ARIA Insights - Full width */}
      <div className="col-span-12">
        <InsightPanel
          insights={insights}
          suggestions={suggestions}
          onPrompt={onPrompt}
        />
      </div>
    </div>
  );
};
