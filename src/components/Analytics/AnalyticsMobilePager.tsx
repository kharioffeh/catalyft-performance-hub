
import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { useAnalyticsUI } from '@/context/AnalyticsUIContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface AnalyticsMobilePagerProps {
  children: React.ReactNode[];
  className?: string;
}

const pages = ['readiness', 'sleep', 'load'];

export const AnalyticsMobilePager: React.FC<AnalyticsMobilePagerProps> = ({ 
  children, 
  className 
}) => {
  const { currentPageIndex, setCurrentPageIndex } = useAnalyticsUI();
  const prefersReducedMotion = useReducedMotion();

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentPageIndex(Math.min(currentPageIndex + 1, pages.length - 1)),
    onSwipedRight: () => setCurrentPageIndex(Math.max(currentPageIndex - 1, 0)),
    trackTouch: true,
    delta: 15, // Prevent conflicts with chart interactions
    preventScrollOnSwipe: true,
  });

  const springConfig = prefersReducedMotion 
    ? { duration: 0 }
    : { 
        type: 'spring' as const,
        stiffness: 400,
        damping: 40,
        mass: 1,
      };

  return (
    <div className={cn('overflow-hidden', className)}>
      <div {...handlers} className="relative">
        <motion.div
          animate={{ x: `-${currentPageIndex * 100}%` }}
          transition={springConfig}
          className="flex w-[300%]"
        >
          {children.map((child, index) => (
            <div key={pages[index]} className="w-full flex-shrink-0 px-4">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-6 gap-2">
        {pages.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              width: currentPageIndex === index ? 24 : 8,
              opacity: currentPageIndex === index ? 1 : 0.4,
            }}
            transition={springConfig}
            className={cn(
              'h-2 rounded-full cursor-pointer',
              currentPageIndex === index ? 'bg-white' : 'bg-white/40'
            )}
            onClick={() => setCurrentPageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
