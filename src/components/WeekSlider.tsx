
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SwipeableViews from 'react-swipeable-views';
import { WeekTable } from '@/components/WeekTable';

interface WeekSliderProps {
  blockJson: {
    weeks?: any[];
  };
}

export const WeekSlider: React.FC<WeekSliderProps> = ({ blockJson }) => {
  const [weekIdx, setWeekIdx] = useState(0);
  
  const weeks = blockJson.weeks || [];
  const totalWeeks = weeks.length;

  if (totalWeeks === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No weeks found in this template
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekIdx(Math.max(0, weekIdx - 1))}
          disabled={weekIdx === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <h3 className="text-lg font-semibold">
          Week {weekIdx + 1} / {totalWeeks}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekIdx(Math.min(totalWeeks - 1, weekIdx + 1))}
          disabled={weekIdx === totalWeeks - 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-hidden">
        <SwipeableViews
          index={weekIdx}
          onChangeIndex={setWeekIdx}
          enableMouseEvents
        >
          {weeks.map((week, index) => (
            <div key={index} className="px-1">
              <WeekTable week={week} />
            </div>
          ))}
        </SwipeableViews>
      </div>
    </div>
  );
};
