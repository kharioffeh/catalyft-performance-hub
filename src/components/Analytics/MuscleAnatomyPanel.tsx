import React from 'react';
import { GlassCard } from '@/components/ui';
import { StressGauge } from '@/components/Dashboard/StressGauge';
import { useEnhancedMetrics } from '@/hooks/useEnhancedMetrics';
import { usePeriod } from '@/lib/hooks/usePeriod';

interface MuscleAnatomyPanelProps {
  selectedAthleteId: string;
}

// Simple anatomical diagram component
const AnatomyDiagram: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Simplified human figure outline */}
      <svg 
        viewBox="0 0 200 400" 
        className="w-full h-full max-h-[380px]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <circle cx="100" cy="30" r="20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        
        {/* Torso */}
        <rect x="80" y="50" width="40" height="80" rx="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        
        {/* Arms */}
        <rect x="50" y="60" width="25" height="50" rx="12" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <rect x="125" y="60" width="25" height="50" rx="12" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        
        {/* Legs */}
        <rect x="85" y="135" width="15" height="80" rx="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <rect x="100" y="135" width="15" height="80" rx="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        
        {/* Muscle group highlights */}
        {/* Shoulders */}
        <circle cx="62" cy="70" r="8" fill="rgba(34, 197, 94, 0.3)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1" />
        <circle cx="138" cy="70" r="8" fill="rgba(34, 197, 94, 0.3)" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="1" />
        
        {/* Chest */}
        <rect x="85" y="65" width="30" height="20" rx="3" fill="rgba(59, 130, 246, 0.3)" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="1" />
        
        {/* Core */}
        <rect x="85" y="90" width="30" height="25" rx="3" fill="rgba(234, 179, 8, 0.3)" stroke="rgba(234, 179, 8, 0.6)" strokeWidth="1" />
        
        {/* Quads */}
        <rect x="87" y="140" width="11" height="35" rx="5" fill="rgba(239, 68, 68, 0.4)" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="1" />
        <rect x="102" y="140" width="11" height="35" rx="5" fill="rgba(239, 68, 68, 0.4)" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="1" />
        
        {/* Calves */}
        <rect x="87" y="185" width="11" height="25" rx="5" fill="rgba(168, 85, 247, 0.3)" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1" />
        <rect x="102" y="185" width="11" height="25" rx="5" fill="rgba(168, 85, 247, 0.3)" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1" />
      </svg>
      
      {/* Muscle group labels */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[18%] left-[15%] text-xs text-green-400 font-medium">Shoulders</div>
        <div className="absolute top-[22%] right-[25%] text-xs text-blue-400 font-medium">Chest</div>
        <div className="absolute top-[30%] right-[25%] text-xs text-yellow-400 font-medium">Core</div>
        <div className="absolute top-[45%] right-[25%] text-xs text-red-400 font-medium">Quadriceps</div>
        <div className="absolute bottom-[25%] right-[25%] text-xs text-purple-400 font-medium">Calves</div>
      </div>
    </div>
  );
};

// ACWR Gauge Component
const ACWRGauge: React.FC<{ value: number }> = ({ value }) => {
  // Convert ACWR to percentage for gauge (0.5-2.0 → 0-100)
  const percentage = Math.min(100, Math.max(0, ((value - 0.5) / 1.5) * 100));
  
  const getACWRColor = (acwr: number) => {
    if (acwr >= 0.8 && acwr <= 1.3) return 'hsl(var(--success))'; // Green - optimal
    if (acwr < 0.8 || (acwr > 1.3 && acwr <= 1.5)) return 'hsl(var(--warning))'; // Yellow - caution
    return 'hsl(var(--destructive))'; // Red - high risk
  };

  const getACWRZone = (acwr: number) => {
    if (acwr >= 0.8 && acwr <= 1.3) return 'Optimal';
    if (acwr < 0.8) return 'Low Load';
    return 'High Risk';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          opacity="0.2"
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getACWRColor(value)}
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center value display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="text-2xl font-display font-bold"
          style={{ color: getACWRColor(value) }}
        >
          {value.toFixed(1)}
        </div>
        <div className="text-xs text-white/60 uppercase tracking-wide">
          ACWR
        </div>
        <div className="text-xs text-white/50 mt-1">
          {getACWRZone(value)}
        </div>
      </div>
    </div>
  );
};

// Training Load Gauge Component
const TrainingLoadGauge: React.FC<{ value: number }> = ({ value }) => {
  const getLoadColor = (load: number) => {
    if (load <= 300) return 'hsl(var(--success))'; // Green - light
    if (load <= 600) return 'hsl(var(--warning))'; // Yellow - moderate
    return 'hsl(var(--destructive))'; // Red - high
  };

  const getLoadZone = (load: number) => {
    if (load <= 300) return 'Light';
    if (load <= 600) return 'Moderate';
    return 'High';
  };

  // Convert load to percentage (0-1000 scale)
  const percentage = Math.min(100, (value / 1000) * 100);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          opacity="0.2"
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getLoadColor(value)}
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center value display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className="text-2xl font-display font-bold"
          style={{ color: getLoadColor(value) }}
        >
          {Math.round(value)}
        </div>
        <div className="text-xs text-white/60 uppercase tracking-wide">
          Load
        </div>
        <div className="text-xs text-white/50 mt-1">
          {getLoadZone(value)}
        </div>
      </div>
    </div>
  );
};

export const MuscleAnatomyPanel: React.FC<MuscleAnatomyPanelProps> = ({
  selectedAthleteId
}) => {
  const { period } = usePeriod();
  const { loadACWR } = useEnhancedMetrics();

  // Get latest ACWR and training load
  const latestData = loadACWR[loadACWR.length - 1];
  const currentACWR = latestData?.acwr_7_28 || 1.1;
  const currentLoad = latestData?.daily_load || 450;

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-min">
      {/* Human Muscle Anatomy - 60% width on desktop, full width on mobile */}
      <div className="col-span-12 lg:col-span-7">
        <GlassCard className="p-6 h-full min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Muscle Training Load</h3>
              <p className="text-white/60 text-sm">Recent training stress by muscle group</p>
            </div>
          </div>
          
          <AnatomyDiagram />
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-400/30 border border-green-400/60"></div>
                <span className="text-white/70">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-400/30 border border-blue-400/60"></div>
                <span className="text-white/70">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-400/30 border border-yellow-400/60"></div>
                <span className="text-white/70">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-400/40 border border-red-400/70"></div>
                <span className="text-white/70">Very High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-400/30 border border-purple-400/60"></div>
                <span className="text-white/70">Recovery</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Training Load & ACWR Gauges - 40% width on desktop, full width on mobile */}
      <div className="col-span-12 lg:col-span-5">
        <GlassCard className="p-6 h-full">
          <h3 className="text-lg font-semibold text-white mb-6">Training Metrics</h3>
          
          <div className="space-y-8">
            {/* Training Load Gauge */}
            <div className="text-center">
              <TrainingLoadGauge value={currentLoad} />
              <div className="mt-3">
                <div className="text-white/60 text-sm">7-Day Average Training Load</div>
                <div className="text-white text-xs mt-1">
                  Target: 300-600 for optimal training stimulus
                </div>
              </div>
            </div>

            {/* ACWR Gauge */}
            <div className="text-center">
              <ACWRGauge value={currentACWR} />
              <div className="mt-3">
                <div className="text-white/60 text-sm">Acute:Chronic Workload Ratio</div>
                <div className="text-white text-xs mt-1">
                  Optimal zone: 0.8 - 1.3 (balanced load progression)
                </div>
              </div>
            </div>
          </div>

          {/* Quick insights */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="text-xs text-white/60">
              <div className="flex justify-between">
                <span>Injury Risk:</span>
                <span className={
                  currentACWR >= 0.8 && currentACWR <= 1.3 ? 'text-green-400' :
                  currentACWR < 0.8 || (currentACWR > 1.3 && currentACWR <= 1.5) ? 'text-yellow-400' :
                  'text-red-400'
                }>
                  {currentACWR >= 0.8 && currentACWR <= 1.3 ? 'Low' :
                   currentACWR < 0.8 || (currentACWR > 1.3 && currentACWR <= 1.5) ? 'Moderate' :
                   'High'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Load Status:</span>
                <span className={
                  currentLoad <= 300 ? 'text-green-400' :
                  currentLoad <= 600 ? 'text-yellow-400' : 'text-red-400'
                }>
                  {currentLoad <= 300 ? 'Light' :
                   currentLoad <= 600 ? 'Moderate' : 'High'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};