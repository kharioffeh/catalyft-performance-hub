
import React from 'react';
import { WeeklySummaryCard } from '@/components/WeeklySummaryCard';

interface AnalyticsWithWeeklySummaryProps {
  children: React.ReactNode;
}

export const AnalyticsWithWeeklySummary: React.FC<AnalyticsWithWeeklySummaryProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
      
      {/* Weekly Summary Card - positioned after main analytics content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WeeklySummaryCard />
        </div>
        <div className="lg:col-span-2">
          {/* This space can be used for additional analytics cards in the future */}
        </div>
      </div>
    </div>
  );
};
