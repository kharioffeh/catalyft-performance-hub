import React from 'react';
import { motion } from 'framer-motion';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { InsightCard } from './InsightCard';
import { useInsights } from '@/hooks/useInsights';
import { SkeletonCard } from '@/components/skeleton/SkeletonCard';

export const InsightCarousel: React.FC = () => {
  const insights = useInsights();

  if (!insights || insights.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="w-72 h-32 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
        <div className="text-xs text-white/60">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {insights.map((insight, index) => (
            <CarouselItem key={insight.id} className="pl-2 sm:pl-4 basis-auto">
              <InsightCard insight={insight} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {insights.length > 1 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-12 bg-white/10 border-white/20 hover:bg-white/20 text-white hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 bg-white/10 border-white/20 hover:bg-white/20 text-white hover:text-white" />
          </>
        )}
      </Carousel>

      {/* Mobile swipe hint */}
      <div className="md:hidden text-center">
        <p className="text-xs text-white/40">Swipe to explore insights</p>
      </div>
    </motion.div>
  );
};