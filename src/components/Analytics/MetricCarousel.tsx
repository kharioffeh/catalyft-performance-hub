
import React, { useRef, useState } from 'react';
import { Tab } from '@headlessui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartView } from './ChartView';

interface MetricCarouselProps {
  children: React.ReactNode[];
  labels?: string[];
}

export const MetricCarousel: React.FC<MetricCarouselProps> = ({ 
  children, 
  labels = ['Readiness', 'Sleep', 'Load', 'Stress'] 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const scrollLeft = index * 280; // snapToInterval value
      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
    setSelectedIndex(index);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const newIndex = Math.round(scrollLeft / 280);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  return (
    <div className="relative">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        {() => (
          <>
            <Tab.List className="flex gap-2 mb-4 overflow-x-auto px-1 scroll-smooth snap-x snap-mandatory md:justify-center">
              {labels.map((label, i) => (
                <Tab
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={({ selected }) =>
                    cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/20 whitespace-nowrap snap-start',
                      selected 
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                    )
                  }
                >
                  {label}
                </Tab>
              ))}
            </Tab.List>

            {/* Enhanced scroll container with snap behavior */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{
                scrollSnapType: 'x mandatory',
                scrollSnapStop: 'always',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
              onScroll={handleScroll}
            >
              {children.map((panel, i) => (
                <div
                  key={i}
                  className="flex-none snap-start"
                  style={{ 
                    width: '280px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <ChartView>
                    {panel}
                  </ChartView>
                </div>
              ))}
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 pointer-events-none z-10">
              <button
                className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                onClick={() => {
                  const prevIndex = selectedIndex === 0 ? children.length - 1 : selectedIndex - 1;
                  scrollToIndex(prevIndex);
                }}
                aria-label="Previous chart"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1" />
              <button
                className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                onClick={() => {
                  const nextIndex = selectedIndex === children.length - 1 ? 0 : selectedIndex + 1;
                  scrollToIndex(nextIndex);
                }}
                aria-label="Next chart"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </>
        )}
      </Tab.Group>
    </div>
  );
};
