
import React, { useRef, useEffect } from 'react';
import { usePeriod, PeriodValue } from '@/lib/hooks/usePeriod';

const options = [
  { label: '7d', value: '7d' as PeriodValue },
  { label: '30d', value: '30d' as PeriodValue },
  { label: '90d', value: '90d' as PeriodValue },
];

export const PeriodToggle: React.FC = () => {
  const { period, setPeriod } = usePeriod();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = options.findIndex(o => o.value === period);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        event.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = options.length - 1;
        event.preventDefault();
        break;
      default:
        return;
    }

    setPeriod(options[newIndex].value);
  };

  // Handle swipe gestures on mobile
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const threshold = 50;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        const currentIndex = options.findIndex(o => o.value === period);
        
        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - go to previous period
          setPeriod(options[currentIndex - 1].value);
        } else if (deltaX < 0 && currentIndex < options.length - 1) {
          // Swipe left - go to next period
          setPeriod(options[currentIndex + 1].value);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [period, setPeriod]);

  return (
    <div 
      ref={containerRef}
      role="radiogroup"
      aria-label="Time period selection"
      className="inline-flex rounded-full bg-white/5 p-1 shadow-inner backdrop-blur-sm border border-white/10"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={period === option.value}
          aria-label={`${option.label} period`}
          onClick={() => setPeriod(option.value)}
          className={`
            px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150
            min-w-[44px] min-h-[44px] flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent
            ${period === option.value 
              ? 'bg-indigo-500 text-white shadow-md transform scale-105' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
            }
          `}
          tabIndex={-1}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
