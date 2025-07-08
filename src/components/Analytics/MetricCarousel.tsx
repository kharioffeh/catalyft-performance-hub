
import React from 'react';
import { Tab } from '@headlessui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCarouselProps {
  children: React.ReactNode[];
  labels?: string[];
}

export const MetricCarousel: React.FC<MetricCarouselProps> = ({ 
  children, 
  labels = ['Readiness', 'Sleep', 'Load', 'Stress'] 
}) => {
  return (
    <div className="relative">
      <Tab.Group>
        {({ selectedIndex }) => (
          <>
            <Tab.List className="flex gap-2 mb-4 overflow-x-auto px-1 scroll-smooth snap-x snap-mandatory md:justify-center">
              {labels.map((label, i) => (
                <Tab
                  key={i}
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

            <Tab.Panels className="relative">
              {children.map((panel, i) => (
                <Tab.Panel
                  key={i}
                  className={cn(
                    'carousel-card focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl',
                    'transition-all duration-300 ease-in-out'
                  )}
                >
                  {panel}
                </Tab.Panel>
              ))}
            </Tab.Panels>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 pointer-events-none">
              <button
                className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                onClick={() => {
                  const prevIndex = selectedIndex === 0 ? children.length - 1 : selectedIndex - 1;
                  // Note: This would need proper Tab.Group API integration
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
                  // Note: This would need proper Tab.Group API integration
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
