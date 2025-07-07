
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InsightToastData {
  id: string;
  message: string;
  type: 'recovery' | 'strain' | 'acwr' | 'general';
  severity: 'green' | 'amber' | 'red';
  duration?: number;
}

interface InsightToastProps {
  insight: InsightToastData;
  onDismiss: (id: string) => void;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'recovery':
      return <TrendingUp className="w-4 h-4" />;
    case 'strain':
      return <Target className="w-4 h-4" />;
    case 'acwr':
      return <Target className="w-4 h-4" />;
    default:
      return <Brain className="w-4 h-4" />;
  }
};

const getSeverityColors = (severity: string) => {
  switch (severity) {
    case 'green':
      return 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300';
    case 'amber':
      return 'border-amber-400/50 bg-amber-500/20 text-amber-300';
    case 'red':
      return 'border-red-400/50 bg-red-500/20 text-red-300';
    default:
      return 'border-indigo-400/50 bg-indigo-500/20 text-indigo-300';
  }
};

export const InsightToast: React.FC<InsightToastProps> = ({ insight, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duration = insight.duration || 5000;

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(insight.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [insight.id, duration, isPaused, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-md border shadow-2xl',
        'bg-black/60 border-white/20 max-w-sm w-full pointer-events-auto',
        getSeverityColors(insight.severity)
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0">
        {getInsightIcon(insight.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight text-white">
          {insight.message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(insight.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Dismiss insight"
      >
        <X className="w-4 h-4 text-white/60 hover:text-white/80" />
      </button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
        initial={{ width: '100%' }}
        animate={{ width: isPaused ? '100%' : '0%' }}
        transition={{ duration: isPaused ? 0 : duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};
