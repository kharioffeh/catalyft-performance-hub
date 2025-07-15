
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
      const scrollLeft = index * scrollRef.current.clientWidth; // Full width scroll
      scrollRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
    setSelectedIndex(index);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const containerWidth = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / containerWidth);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        {() => (
          <>
            {/* Enhanced Tab Navigation */}
            <div className="mb-6">
              <Tab.List className="flex gap-3 justify-center overflow-x-auto px-4 pb-2">
                {labels.map((label, i) => (
                  <Tab
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    className={({ selected }) =>
                      cn(
                        'px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 whitespace-nowrap min-w-[120px]',
                        selected 
                          ? 'bg-primary/20 text-primary border-2 border-primary/30 shadow-lg scale-105' 
                          : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border-2 border-transparent hover:border-border/50'
                      )
                    }
                  >
                    {label}
                  </Tab>
                ))}
              </Tab.List>
              
              {/* Indicator Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {children.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      selectedIndex === i 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                    )}
                    aria-label={`Go to ${labels[i]} chart`}
                  />
                ))}
              </div>
            </div>

            {/* Full-width scroll container */}
            <div className="relative">
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
                    className="flex-none snap-start w-full"
                    style={{ 
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <ChartView className="mx-4">
                      {panel}
                    </ChartView>
                  </div>
                ))}
              </div>

              {/* Enhanced Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 pointer-events-none z-10 hidden sm:flex justify-between">
                <button
                  className="pointer-events-auto p-3 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50 hover:border-border transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    const prevIndex = selectedIndex === 0 ? children.length - 1 : selectedIndex - 1;
                    scrollToIndex(prevIndex);
                  }}
                  aria-label="Previous chart"
                  disabled={children.length <= 1}
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <button
                  className="pointer-events-auto p-3 rounded-full bg-background/90 hover:bg-background shadow-lg border border-border/50 hover:border-border transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    const nextIndex = selectedIndex === children.length - 1 ? 0 : selectedIndex + 1;
                    scrollToIndex(nextIndex);
                  }}
                  aria-label="Next chart"
                  disabled={children.length <= 1}
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>
          </>
        )}
      </Tab.Group>
    </div>
  );
};
