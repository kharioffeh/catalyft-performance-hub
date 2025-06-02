
import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { WeekTable } from '@/components/WeekTable';

interface WeekSliderProps {
  blockJson: any;
}

export default function WeekSlider({ blockJson }: WeekSliderProps) {
  const weeks = blockJson.weeks || [];
  const [idx, setIdx] = useState(0);
  
  return (
    <>
      <div className="flex items-center mb-2">
        <button 
          className="btn-ghost" 
          disabled={idx === 0} 
          onClick={() => setIdx(idx - 1)}
        >
          ‹
        </button>
        <span className="mx-4">Week {idx + 1} / {weeks.length}</span>
        <button 
          className="btn-ghost" 
          disabled={idx === weeks.length - 1} 
          onClick={() => setIdx(idx + 1)}
        >
          ›
        </button>
      </div>
      <SwipeableViews index={idx} onChangeIndex={setIdx}>
        {weeks.map((week: any, i: number) => (
          <WeekTable key={i} week={week} />
        ))}
      </SwipeableViews>
    </>
  );
}
