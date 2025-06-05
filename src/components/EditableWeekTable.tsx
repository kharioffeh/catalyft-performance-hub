
import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InlineTable from '@/components/InlineTable';

interface EditableWeekTableProps {
  blockJson: any;
  editable: boolean;
  onChange: (blockJson: any) => void;
}

export default function EditableWeekTable({ blockJson, editable, onChange }: EditableWeekTableProps) {
  const [idx, setIdx] = useState(0);
  
  // Ensure we always have an array for weeks
  const weeks = Array.isArray(blockJson?.weeks) ? blockJson.weeks : [];

  console.log('EditableWeekTable blockJson:', blockJson);
  console.log('EditableWeekTable weeks:', weeks);

  const updateCell = (weekIdx: number, sessIdx: number, exIdx: number, field: string, value: any) => {
    const clone = JSON.parse(JSON.stringify(blockJson));
    
    // Ensure the nested structure exists
    if (!clone.weeks) clone.weeks = [];
    if (!Array.isArray(clone.weeks)) clone.weeks = [];
    if (!clone.weeks[weekIdx]) clone.weeks[weekIdx] = [];
    if (!Array.isArray(clone.weeks[weekIdx])) clone.weeks[weekIdx] = [];
    if (!clone.weeks[weekIdx][sessIdx]) clone.weeks[weekIdx][sessIdx] = { exercises: [] };
    if (!clone.weeks[weekIdx][sessIdx].exercises) clone.weeks[weekIdx][sessIdx].exercises = [];
    if (!Array.isArray(clone.weeks[weekIdx][sessIdx].exercises)) clone.weeks[weekIdx][sessIdx].exercises = [];
    if (!clone.weeks[weekIdx][sessIdx].exercises[exIdx]) return;
    
    clone.weeks[weekIdx][sessIdx].exercises[exIdx][field] = value;
    onChange(clone);
  };

  if (weeks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No weeks available in this template.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <span className="text-lg font-medium">
          Week {idx + 1} / {weeks.length}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIdx(Math.min(weeks.length - 1, idx + 1))}
          disabled={idx === weeks.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <SwipeableViews index={idx} onChangeIndex={setIdx} enableMouseEvents>
        {weeks.map((week: any, weekIndex: number) => (
          <div key={weekIndex} className="px-1">
            <InlineTable 
              week={week} 
              weekIdx={weekIndex} 
              editable={editable} 
              onEdit={updateCell}
            />
          </div>
        ))}
      </SwipeableViews>
    </>
  );
}
