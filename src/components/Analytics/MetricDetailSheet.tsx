
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAnalyticsUI } from '@/context/AnalyticsUIContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface MetricDetailSheetProps {
  className?: string;
}

export const MetricDetailSheet: React.FC<MetricDetailSheetProps> = ({ className }) => {
  const { selectedMetric, setSelectedMetric } = useAnalyticsUI();
  const prefersReducedMotion = useReducedMotion();

  const springConfig = prefersReducedMotion
    ? { duration: 0.1 }
    : {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      };

  const getMetricContent = (metric: string) => {
    switch (metric) {
      case 'readiness':
        return {
          title: 'Readiness Score',
          color: 'text-readiness',
          bgColor: 'bg-readiness/10',
          description: 'Your body\'s readiness for training based on HRV, sleep quality, and recovery metrics.',
        };
      case 'sleep':
        return {
          title: 'Sleep Quality',
          color: 'text-sleep',
          bgColor: 'bg-sleep/10',
          description: 'Sleep duration, efficiency, and recovery patterns from your wearable device.',
        };
      case 'load':
        return {
          title: 'Training Load',
          color: 'text-load',
          bgColor: 'bg-load/10',
          description: 'Acute vs chronic workload ratio to optimize training and prevent overreaching.',
        };
      case 'strain':
        return {
          title: 'Daily Strain',
          color: 'text-strain',
          bgColor: 'bg-strain/10',
          description: 'Cardiovascular stress and training intensity from your daily activities.',
        };
      default:
        return {
          title: 'Metric Details',
          color: 'text-white',
          bgColor: 'bg-white/10',
          description: 'Detailed metric information and insights.',
        };
    }
  };

  const content = selectedMetric ? getMetricContent(selectedMetric) : null;

  return (
    <AnimatePresence>
      {selectedMetric && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedMetric(null)}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springConfig}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-card backdrop-blur-lg border-t border-border rounded-t-2xl',
              'h-[80vh] overflow-y-auto',
              className
            )}
          >
            <div className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={cn('text-xl font-semibold', content?.color)}>
                    {content?.title}
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    {content?.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className={cn('rounded-xl p-4 mb-6', content?.bgColor)}>
                <h3 className="font-medium mb-2">Quick Insights</h3>
                <p className="text-sm text-white/80">
                  Detailed analysis and recommendations for your {content?.title.toLowerCase()} will appear here.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-medium mb-2">Historical Trend</h4>
                  <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-white/60">Chart placeholder</span>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <p className="text-sm text-white/80">
                    Personalized recommendations based on your {content?.title.toLowerCase()} patterns.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
