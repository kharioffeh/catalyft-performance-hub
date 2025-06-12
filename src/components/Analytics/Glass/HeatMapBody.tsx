
import React from 'react';
import { cn } from '@/lib/utils';

interface HeatMapBodyProps {
  className?: string;
  period: string;
}

export const HeatMapBody: React.FC<HeatMapBodyProps> = ({ className, period }) => {
  const regions = [
    { id: "leftQuad", load: 70, name: "Left Quadriceps" },
    { id: "rightQuad", load: 40, name: "Right Quadriceps" },
    { id: "back", load: 90, name: "Lower Back" },
    { id: "leftCalf", load: 55, name: "Left Calf" },
    { id: "rightCalf", load: 45, name: "Right Calf" },
    { id: "core", load: 75, name: "Core" }
  ];

  const getLoadColor = (load: number) => {
    if (load < 50) return "#22c55e"; // Green
    if (load < 75) return "#facc15"; // Yellow
    return "#ef4444"; // Red
  };

  const getLoadIntensity = (load: number) => {
    return Math.min(load / 100, 1);
  };

  return (
    <div className={cn("relative", className)}>
      <h3 className="text-white font-medium mb-4">Training Load Heat Map</h3>
      
      {/* Body SVG */}
      <div className="relative bg-white/5 rounded-xl p-8 backdrop-blur">
        <svg viewBox="0 0 200 400" className="w-full h-full max-h-80">
          {/* Head */}
          <circle cx="100" cy="30" r="20" fill="rgba(255,255,255,0.1)" stroke="#374151" strokeWidth="1"/>
          
          {/* Torso */}
          <rect x="70" y="50" width="60" height="100" rx="10" 
                fill={getLoadColor(regions.find(r => r.id === 'core')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'core')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
          
          {/* Arms */}
          <rect x="40" y="60" width="25" height="60" rx="12" fill="rgba(255,255,255,0.1)" stroke="#374151" strokeWidth="1"/>
          <rect x="135" y="60" width="25" height="60" rx="12" fill="rgba(255,255,255,0.1)" stroke="#374151" strokeWidth="1"/>
          
          {/* Legs - Quads */}
          <rect x="75" y="160" width="20" height="80" rx="10" 
                fill={getLoadColor(regions.find(r => r.id === 'leftQuad')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'leftQuad')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
          <rect x="105" y="160" width="20" height="80" rx="10" 
                fill={getLoadColor(regions.find(r => r.id === 'rightQuad')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'rightQuad')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
          
          {/* Calves */}
          <rect x="77" y="250" width="16" height="60" rx="8" 
                fill={getLoadColor(regions.find(r => r.id === 'leftCalf')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'leftCalf')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
          <rect x="107" y="250" width="16" height="60" rx="8" 
                fill={getLoadColor(regions.find(r => r.id === 'rightCalf')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'rightCalf')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
          
          {/* Back indicator */}
          <rect x="85" y="70" width="30" height="40" rx="5" 
                fill={getLoadColor(regions.find(r => r.id === 'back')?.load || 0)} 
                opacity={getLoadIntensity(regions.find(r => r.id === 'back')?.load || 0)}
                stroke="#374151" strokeWidth="1"/>
        </svg>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white/70">Low (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-white/70">Medium (50-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white/70">High (75+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
