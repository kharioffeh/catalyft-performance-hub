
import React from 'react';
import { Download } from 'lucide-react';
import { PeriodToggle } from '@/components/ui/PeriodToggle';

interface AnalyticsControlsProps {
  // Remove athlete selection since solo athletes don't need to select between athletes
}

export const AnalyticsControls: React.FC<AnalyticsControlsProps> = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Your Analytics</h2>
        </div>
        <button className="flex items-center gap-2 text-xs px-3 py-2 border border-border rounded-lg hover:bg-white/5 transition text-white">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Period Toggle */}
      <div className="flex justify-center mb-6">
        <PeriodToggle />
      </div>
    </div>
  );
};
