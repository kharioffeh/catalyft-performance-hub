
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedDotProps {
  cx: number;
  cy: number;
  r?: number;
  fill?: string;
  index?: number;
  className?: string;
}

export const AnimatedDot: React.FC<AnimatedDotProps> = ({
  cx,
  cy,
  r = 3,
  fill = '#3b82f6',
  index = 0,
  className = ""
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        className={className}
      />
    );
  }

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: "easeOut"
      }}
    />
  );
};
