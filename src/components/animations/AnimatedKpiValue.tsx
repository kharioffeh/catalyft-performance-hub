
import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedKpiValueProps {
  value: number | string;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedKpiValue: React.FC<AnimatedKpiValueProps> = ({
  value,
  duration = 1,
  delay = 0,
  className = "",
  suffix = "",
  decimals = 0
}) => {
  const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.2, triggerOnce: true });
  const prefersReducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    duration: duration * 1000, 
    bounce: 0 
  });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      // If reduced motion or not in view, show final value immediately
      if (displayRef.current) {
        const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
        const displayValue = decimals > 0 ? numericValue.toFixed(decimals) : Math.round(numericValue).toString();
        displayRef.current.textContent = displayValue + suffix;
      }
      return;
    }

    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
    
    if (numericValue === 0) {
      if (displayRef.current) {
        displayRef.current.textContent = "0" + suffix;
      }
      return;
    }

    const timeout = setTimeout(() => {
      motionValue.set(numericValue);
    }, delay * 1000);

    const unsubscribe = springValue.on('change', (latest) => {
      if (displayRef.current) {
        const displayValue = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
        displayRef.current.textContent = displayValue + suffix;
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [isInView, value, duration, delay, suffix, decimals, motionValue, springValue, prefersReducedMotion]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <span ref={displayRef}>0{suffix}</span>
    </motion.span>
  );
};
