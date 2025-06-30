
import React from 'react';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface AgendaHeaderProps {
  selectedDate: Date;
  onDatePickerOpen: () => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  selectedDate,
  onDatePickerOpen
}) => {
  return (
    <GlassContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-800 dark:text-white" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Schedule</h1>
        </div>
        
        <button
          onClick={onDatePickerOpen}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200"
        >
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </GlassContainer>
  );
};
