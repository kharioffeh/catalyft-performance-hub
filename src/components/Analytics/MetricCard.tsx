import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { animate } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLongPress } from '@/hooks/useLongPress';
import { useAnalyticsUI } from '@/context/AnalyticsUIContext';
import { useShareUI } from '@/context/ShareUIContext';
import { ShareButton } from '@/components/ShareButton';

interface MetricCardProps {
  metric: 'readiness' | 'sleep' | 'load' | 'strain';
  title: string;
  latest?: number;
  delta?: number;
  onClick: () => void;
  unit?: string;
  target?: number;
  children?: React.ReactNode;
  data?: any[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  title,
  latest,
  delta,
  onClick,
  unit = "",
  target,
  children,
  data = []
}) => {
  const valueRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inViewRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, triggerOnce: true });
  const prefersReducedMotion = useReducedMotion();
  const { setSelectedMetric } = useAnalyticsUI();
  const { openSheet } = useShareUI();

  const longPressHandlers = useLongPress({
    onLongPress: () => setSelectedMetric(metric),
    delay: 500,
    enabled: true,
  });

  const handleShare = () => {
    if (!cardRef.current) return;
    
    openSheet({
      chartRef: cardRef,
      metrics: data,
      title: `${title} Metrics`,
      filename: `catalyft-${metric.toLowerCase()}`
    });
  };

  const getTrendIcon = () => {
    if (delta === undefined) return null;
    if (delta > 0) return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (delta < 0) return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (delta === undefined) return "text-gray-500";
    if (delta > 0) return "text-green-600";
    if (delta < 0) return "text-red-600";
    return "text-gray-500";
  };

  const formatValue = (value?: number) => {
    if (value === undefined) return "—";
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const getProgressPercentage = () => {
    if (!target || latest === undefined) return 0;
    return Math.min((latest / target) * 100, 100);
  };

  // Count-up animation for the main value
  useIsomorphicLayoutEffect(() => {
    if (!isInView || !valueRef.current || latest === undefined || prefersReducedMotion) {
      if (valueRef.current) {
        valueRef.current.textContent = formatValue(latest) + unit;
      }
      return;
    }

    const numericValue = Number(latest);
    if (isNaN(numericValue)) {
      if (valueRef.current) {
        valueRef.current.textContent = formatValue(latest) + unit;
      }
      return;
    }

    // Animate from 0 to the actual value
    const controls = animate(0, numericValue, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (value) => {
        if (valueRef.current) {
          const formattedValue = numericValue % 1 === 0 ? Math.round(value).toString() : value.toFixed(1);
          valueRef.current.textContent = formattedValue + unit;
        }
      }
    });

    return () => controls.stop();
  }, [isInView, latest, unit, prefersReducedMotion]);

  return (
    <div 
      ref={(node) => {
        cardRef.current = node;
        inViewRef(node);
      }}
      onClick={onClick}
      {...longPressHandlers()}
      className={cn(
        'relative rounded-xl bg-card backdrop-blur-lg border border-border p-4 cursor-pointer transition-all duration-200 touch-manipulation',
        `before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:ring-1 before:ring-${metric}/ring`,
        `hover:bg-${metric}/10`,
        'active:scale-95'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs text-white/60 font-medium">{title}</h3>
            <span 
              ref={valueRef}
              className={cn(
                "text-3xl font-semibold",
                `text-${metric}`
              )}
            >
              {formatValue(latest)}{unit}
            </span>
            {delta !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(delta).toFixed(1)}</span>
              </div>
            )}
          </div>
          {delta !== undefined && (
            <p className="text-xs text-white/40 mt-1">vs 7d avg</p>
          )}
        </div>
        <ShareButton 
          onClick={handleShare}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      
      {target && latest !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Progress to target</span>
            <span>{target}{unit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                `bg-${metric}`
              )}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};
