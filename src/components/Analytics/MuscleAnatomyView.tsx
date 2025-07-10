import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MuscleLoadMap {
  shoulders: number;
  chest: number;
  biceps: number;
  triceps: number;
  core: number;
  quads: number;
  hamstrings: number;
  calves: number;
}

interface MuscleAnatomyViewProps {
  loadMap: MuscleLoadMap;
}

export const MuscleAnatomyView: React.FC<MuscleAnatomyViewProps> = ({ loadMap }) => {
  const [isBackView, setIsBackView] = useState(false);

  // Convert load value (0-100) to color gradient from green (#10B981) to red (#DC2626)
  const getColorFromLoad = (load: number): string => {
    const normalized = Math.max(0, Math.min(100, load)) / 100;
    
    // Green RGB: 16, 185, 129
    // Red RGB: 220, 38, 38
    const r = Math.round(16 + (220 - 16) * normalized);
    const g = Math.round(185 + (38 - 185) * normalized);
    const b = Math.round(129 + (38 - 129) * normalized);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const toggleView = () => {
    setIsBackView(!isBackView);
  };

  const FrontView = () => (
    <svg
      viewBox="0 0 300 600"
      className="w-full h-full"
      style={{ maxWidth: '300px' }}
    >
      {/* Head */}
      <ellipse cx="150" cy="60" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Shoulders/Deltoids */}
      <ellipse 
        cx="110" cy="120" rx="20" ry="25" 
        fill={getColorFromLoad(loadMap.shoulders)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="190" cy="120" rx="20" ry="25" 
        fill={getColorFromLoad(loadMap.shoulders)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Chest/Pectorals */}
      <ellipse 
        cx="150" cy="140" rx="35" ry="30" 
        fill={getColorFromLoad(loadMap.chest)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Biceps */}
      <ellipse 
        cx="95" cy="180" rx="12" ry="25" 
        fill={getColorFromLoad(loadMap.biceps)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="205" cy="180" rx="12" ry="25" 
        fill={getColorFromLoad(loadMap.biceps)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Core/Abs */}
      <rect 
        x="125" y="180" width="50" height="80" rx="10"
        fill={getColorFromLoad(loadMap.core)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Arms */}
      <rect x="85" y="160" width="20" height="100" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="195" y="160" width="20" height="100" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Torso outline */}
      <rect x="115" y="100" width="70" height="180" rx="15" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Quadriceps */}
      <ellipse 
        cx="135" cy="350" rx="15" ry="40" 
        fill={getColorFromLoad(loadMap.quads)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="165" cy="350" rx="15" ry="40" 
        fill={getColorFromLoad(loadMap.quads)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Legs outline */}
      <rect x="125" y="290" width="25" height="120" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="150" y="290" width="25" height="120" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Calves */}
      <ellipse 
        cx="135" cy="470" rx="12" ry="30" 
        fill={getColorFromLoad(loadMap.calves)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="165" cy="470" rx="12" ry="30" 
        fill={getColorFromLoad(loadMap.calves)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Lower legs outline */}
      <rect x="125" y="420" width="25" height="100" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="150" y="420" width="25" height="100" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  const BackView = () => (
    <svg
      viewBox="0 0 300 600"
      className="w-full h-full"
      style={{ maxWidth: '300px' }}
    >
      {/* Head */}
      <ellipse cx="150" cy="60" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Shoulders/Posterior Deltoids */}
      <ellipse 
        cx="110" cy="120" rx="20" ry="25" 
        fill={getColorFromLoad(loadMap.shoulders)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="190" cy="120" rx="20" ry="25" 
        fill={getColorFromLoad(loadMap.shoulders)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Triceps */}
      <ellipse 
        cx="95" cy="180" rx="12" ry="25" 
        fill={getColorFromLoad(loadMap.triceps)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="205" cy="180" rx="12" ry="25" 
        fill={getColorFromLoad(loadMap.triceps)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Core/Lower Back */}
      <rect 
        x="125" y="180" width="50" height="80" rx="10"
        fill={getColorFromLoad(loadMap.core)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Arms outline */}
      <rect x="85" y="160" width="20" height="100" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="195" y="160" width="20" height="100" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Torso outline */}
      <rect x="115" y="100" width="70" height="180" rx="15" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Hamstrings */}
      <ellipse 
        cx="135" cy="350" rx="15" ry="40" 
        fill={getColorFromLoad(loadMap.hamstrings)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="165" cy="350" rx="15" ry="40" 
        fill={getColorFromLoad(loadMap.hamstrings)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Legs outline */}
      <rect x="125" y="290" width="25" height="120" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="150" y="290" width="25" height="120" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      
      {/* Calves */}
      <ellipse 
        cx="135" cy="470" rx="12" ry="30" 
        fill={getColorFromLoad(loadMap.calves)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      <ellipse 
        cx="165" cy="470" rx="12" ry="30" 
        fill={getColorFromLoad(loadMap.calves)}
        stroke="currentColor" 
        strokeWidth="2"
        opacity="0.8"
      />
      
      {/* Lower legs outline */}
      <rect x="125" y="420" width="25" height="100" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="150" y="420" width="25" height="100" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleView}
        className="flex items-center space-x-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{isBackView ? 'Front View' : 'Back View'}</span>
      </Button>
      
      {/* Anatomy Diagram */}
      <div 
        className="flex justify-center items-center"
        style={{ maxWidth: '300px', width: '100%' }}
      >
        <div className="text-muted-foreground">
          {isBackView ? <BackView /> : <FrontView />}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#10B981' }}
          />
          <span className="text-muted-foreground">Low Load</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#DC2626' }}
          />
          <span className="text-muted-foreground">High Load</span>
        </div>
      </div>
    </div>
  );
};