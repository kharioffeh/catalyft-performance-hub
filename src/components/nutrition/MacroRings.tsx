import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MacroData {
  protein: { current: number; target: number; color: string };
  carbs: { current: number; target: number; color: string };
  fat: { current: number; target: number; color: string };
}

interface MacroRingsProps {
  macros: MacroData;
  className?: string;
}

interface RingProps {
  progress: number;
  color: string;
  radius: number;
  strokeWidth: number;
  delay?: number;
}

const Ring: React.FC<RingProps> = ({ progress, color, radius, strokeWidth, delay = 0 }) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <circle
      cx="120"
      cy="120"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      className="transition-all duration-1000 ease-out"
      style={{
        animationDelay: `${delay}ms`,
        transform: 'rotate(-90deg)',
        transformOrigin: '120px 120px',
      }}
    />
  );
};

export const MacroRings: React.FC<MacroRingsProps> = ({ macros, className = '' }) => {
  const proteinProgress = (macros.protein.current / macros.protein.target) * 100;
  const carbsProgress = (macros.carbs.current / macros.carbs.target) * 100;
  const fatProgress = (macros.fat.current / macros.fat.target) * 100;

  return (
    <Card className={`bg-white/5 border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white text-center">
          Daily Macros
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* SVG Rings */}
        <div className="relative">
          <svg width="240" height="240" className="animate-fade-in">
            {/* Background circles */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            <circle
              cx="120"
              cy="120"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="120"
              cy="120"
              r="60"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            
            {/* Progress rings */}
            <Ring
              progress={proteinProgress}
              color={macros.protein.color}
              radius={100}
              strokeWidth={12}
              delay={200}
            />
            <Ring
              progress={carbsProgress}
              color={macros.carbs.color}
              radius={80}
              strokeWidth={10}
              delay={400}
            />
            <Ring
              progress={fatProgress}
              color={macros.fat.color}
              radius={60}
              strokeWidth={8}
              delay={600}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-white mb-1 animate-scale-in">
              {Math.round((proteinProgress + carbsProgress + fatProgress) / 3)}%
            </div>
            <div className="text-sm text-white/70 animate-fade-in">
              Average
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 w-full mt-6 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: macros.protein.color }}
              />
              <span className="text-sm font-medium text-white">Protein</span>
            </div>
            <div className="text-xs text-white/70">
              {macros.protein.current}g / {macros.protein.target}g
            </div>
            <div className="text-xs text-white/50">
              {Math.round(proteinProgress)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: macros.carbs.color }}
              />
              <span className="text-sm font-medium text-white">Carbs</span>
            </div>
            <div className="text-xs text-white/70">
              {macros.carbs.current}g / {macros.carbs.target}g
            </div>
            <div className="text-xs text-white/50">
              {Math.round(carbsProgress)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: macros.fat.color }}
              />
              <span className="text-sm font-medium text-white">Fat</span>
            </div>
            <div className="text-xs text-white/70">
              {macros.fat.current}g / {macros.fat.target}g
            </div>
            <div className="text-xs text-white/50">
              {Math.round(fatProgress)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};