import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';

interface AnalyticsHeroSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  currentScore: number | null;
  scoreUnit?: string;
  scoreColor: string;
  sparklineData?: Array<{ value: number }>;
  trend?: 'up' | 'down' | 'stable';
  period: 7 | 30 | 90;
  onPeriodChange: (period: 7 | 30 | 90) => void;
}

export const AnalyticsHeroSection: React.FC<AnalyticsHeroSectionProps> = ({
  icon: Icon,
  title,
  description,
  currentScore,
  scoreUnit = '',
  scoreColor,
  sparklineData,
  trend = 'stable',
  period,
  onPeriodChange
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-6 sm:p-8 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        {/* Top section - Icon, Score, Title for mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
          {/* Metric Icon */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/20 self-start">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 lg:space-x-8 space-y-4 sm:space-y-0">
            {/* Current Score */}
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1">
                <span 
                  className="text-3xl sm:text-4xl font-display font-bold"
                  style={{ color: scoreColor }}
                >
                  {currentScore !== null ? Math.round(currentScore) : '--'}
                </span>
                {scoreUnit && (
                  <span className="text-base sm:text-lg text-white/60 font-medium">{scoreUnit}</span>
                )}
              </div>
              <div className="text-sm text-white/60 mt-1">
                Current {title.split(' ')[0]}
              </div>
            </div>

            {/* 7-Day Trend Sparkline - hidden on small mobile */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="hidden sm:flex flex-col items-center">
                <div className="text-xs text-white/60 mb-1">7-Day Trend</div>
                <MiniSparkline 
                  data={sparklineData} 
                  color={scoreColor}
                  trend={trend}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - Title, Description, Period Selector */}
        <div className="text-left lg:text-right">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{title}</h1>
            <p className="text-white/70 mt-1 text-sm sm:text-base">{description}</p>
          </div>
          
          {/* Period Selector Pills */}
          <div className="flex flex-wrap gap-1 lg:justify-end">
            <div className="flex space-x-1 bg-white/10 rounded-full p-1 border border-white/20">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-w-[44px] ${
                    period === d 
                      ? "bg-white/20 text-white shadow-sm" 
                      : "text-white/60 hover:text-white/80 hover:bg-white/5"
                  }`}
                  onClick={() => onPeriodChange(d as 7 | 30 | 90)}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};