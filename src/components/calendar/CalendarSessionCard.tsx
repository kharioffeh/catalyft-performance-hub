import React, { useState } from 'react';
import { Session } from '@/types/training';

interface SessionCardProps {
  session: Session;
  onTooltip?: (show: boolean) => void;
}

const getLoadBorderColor = (loadPercent?: number): string => {
  if (loadPercent === undefined) return 'border-white/20';
  
  // HSL formula: hsl(120 - 120*loadPercent/100, 80%, 60%)
  const hue = Math.max(0, 120 - (120 * loadPercent) / 100);
  return `hsl(${hue}, 80%, 60%)`;
};

const getLoadInfo = (session: Session): string => {
  const loadText = session.loadPercent !== undefined ? `Load: ${session.loadPercent}%` : 'Load: N/A';
  const prText = session.isPR ? ' • PR' : '';
  return loadText + prText;
};

export const CalendarSessionCard: React.FC<SessionCardProps> = ({ session, onTooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const startTime = new Date(session.start_ts).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const borderColor = session.isPR ? 'border-electric-blue' : '';
  const customBorderColor = !session.isPR ? getLoadBorderColor(session.loadPercent) : '';

  const handleMouseEnter = () => {
    setShowTooltip(true);
    onTooltip?.(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    onTooltip?.(false);
  };

  return (
    <div className="relative">
      <div 
        className={`
          mb-1 px-2 py-1 rounded-lg bg-white/10 border-2 relative
          ${borderColor || 'border-white/20'}
          hover:bg-white/15 transition-colors cursor-pointer
        `}
        style={customBorderColor ? { borderColor: customBorderColor } : {}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={getLoadInfo(session)}
      >
        <div className="flex items-center gap-1 relative">
          <div className="w-2 h-2 rounded-full bg-electric-blue"></div>
          <span className="text-xs text-white font-medium">
            {startTime}
          </span>
          <span className="text-xs text-white/70 capitalize">
            {session.type}
          </span>
          
          {/* PR Badge */}
          {session.isPR && (
            <span className="absolute -top-1 -right-1 text-sm">🏅</span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded whitespace-nowrap">
          {getLoadInfo(session)}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </div>
  );
};