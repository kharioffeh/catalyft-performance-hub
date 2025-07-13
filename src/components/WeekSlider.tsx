
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeekTable from '@/components/WeekTable';

interface WeekSliderProps {
  blockJson: any;
}

export default function WeekSlider({ blockJson }: WeekSliderProps) {
  const [idx, setIdx] = useState(0);
  
  console.log('WeekSlider received blockJson:', blockJson);
  
  // Ensure we always have an array for weeks
  const weeks = Array.isArray(blockJson?.weeks) ? blockJson.weeks : [];
  
  console.log('WeekSlider processed weeks:', weeks);
  
  if (weeks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No weeks available in this template.</p>
      </div>
    );
  }
  
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
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <WeekTable week={weeks[idx]} />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
