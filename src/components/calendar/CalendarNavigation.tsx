import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths } from 'date-fns';

interface CalendarNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  currentDate,
  onDateChange,
}) => {
  const handlePrevMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mb-6">
      <div className="flex items-center gap-4">
        <CalendarIcon className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="border-electric-blue/40 text-electric-blue hover:bg-electric-blue/10"
        >
          Today
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="border-electric-blue/40 text-electric-blue hover:bg-electric-blue/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="border-electric-blue/40 text-electric-blue hover:bg-electric-blue/10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};