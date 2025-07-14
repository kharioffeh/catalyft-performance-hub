import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { cn } from '@/lib/utils';

interface Metric {
  name: string;
  value: number;
  delta?: number;
  unit?: string;
}

interface MetricsCarouselProps {
  metrics: Metric[];
  className?: string;
}

export const MetricsCarousel: React.FC<MetricsCarouselProps> = ({
  metrics,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % metrics.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + metrics.length) % metrics.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      }
    };

    // Add event listener when component mounts
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  const getTrendIcon = (delta?: number) => {
    if (delta === undefined || delta === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (delta?: number) => {
    if (delta === undefined || delta === 0) return "text-gray-500";
    if (delta > 0) return "text-green-600";
    return "text-red-600";
  };

  const formatValue = (value: number, unit?: string) => {
    const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(1);
    return `${formattedValue}${unit || ''}`;
  };

  if (!metrics || metrics.length === 0) {
    return (
      <div className={cn("text-center text-white/60 py-8", className)}>
        No metrics available
      </div>
    );
  }

  const currentMetric = metrics[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className={cn("relative w-full", className)}
      role="region"
      aria-label="Metrics carousel"
      data-testid="metrics-carousel"
    >
      {/* Web: Single large card with arrow buttons */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-center">
          {/* Left arrow button */}
          {metrics.length > 1 && (
            <button
              onClick={prevSlide}
              className="absolute left-0 z-10 p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Previous metric"
              data-testid="prev-button"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Metric Card */}
          <div 
            className="w-full max-w-md mx-auto"
            style={{ minWidth: '420px' }}
          >
            <div 
              className="bg-white/5 border border-white/10 rounded-xl p-6 h-[230px] flex flex-col justify-center"
              data-testid="metric-card"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-white/80 mb-4">
                  {currentMetric.name}
                </h3>
                <div className="text-4xl font-bold text-white mb-4">
                  {formatValue(currentMetric.value, currentMetric.unit)}
                </div>
                {currentMetric.delta !== undefined && (
                  <div className={cn("flex items-center justify-center gap-2 text-sm", getTrendColor(currentMetric.delta))}>
                    {getTrendIcon(currentMetric.delta)}
                    <span>{Math.abs(currentMetric.delta).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right arrow button */}
          {metrics.length > 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-0 z-10 p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              aria-label="Next metric"
              data-testid="next-button"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: Horizontal swipe carousel */}
      <div className="md:hidden" {...swipeHandlers}>
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          data-testid="mobile-carousel"
        >
          {metrics.map((metric, index) => (
            <div
              key={`${metric.name}-${index}`}
              className="w-full flex-shrink-0 px-4"
            >
              <div 
                className="bg-white/5 border border-white/10 rounded-xl p-6 h-[230px] flex flex-col justify-center"
                data-testid="metric-card"
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white/80 mb-4">
                    {metric.name}
                  </h3>
                  <div className="text-4xl font-bold text-white mb-4">
                    {formatValue(metric.value, metric.unit)}
                  </div>
                  {metric.delta !== undefined && (
                    <div className={cn("flex items-center justify-center gap-2 text-sm", getTrendColor(metric.delta))}>
                      {getTrendIcon(metric.delta)}
                      <span>{Math.abs(metric.delta).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {metrics.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {metrics.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-white" : "bg-white/30"
              )}
              aria-label={`Go to metric ${index + 1}`}
              data-testid={`dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};