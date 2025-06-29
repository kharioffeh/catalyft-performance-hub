
import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { Activity } from 'lucide-react';

interface HeatMapCardProps {
  athleteId: string;
  className?: string;
}

export const HeatMapCard: React.FC<HeatMapCardProps> = ({ athleteId, className }) => {
  return (
    <GlassCard className={`p-6 bg-green-500/10 border-green-400/30 ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Muscle Load Heat Map</h3>
      </div>
      <div className="h-64">
        <HeatMapBody 
          className="w-full h-full" 
          period="7d" 
          athleteId={athleteId} 
        />
      </div>
    </GlassCard>
  );
};
