import React, { useState } from 'react';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarGrid } from './CalendarGrid';
import { Session } from '@/types/training';

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  isLoading?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  onSessionClick,
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading navigation */}
        <div className="h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse" />
        
        {/* Loading grid */}
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }).map((_, i) => (
            <div 
              key={i} 
              className="h-32 md:h-40 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse" 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarNavigation
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />
      
      <CalendarGrid
        currentDate={currentDate}
        sessions={sessions}
        onSessionClick={onSessionClick}
      />
    </div>
  );
};