
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PulseWrapperProps {
  children: React.ReactNode;
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const PulseWrapper: React.FC<PulseWrapperProps> = ({
  children,
  isActive,
  intensity = 'medium',
  className = ""
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (!isActive || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getAnimationConfig = () => {
    switch (intensity) {
      case 'low':
        return {
          scale: [1, 1.02, 1],
          duration: 2,
          ease: "easeInOut"
        };
      case 'medium':
        return {
          scale: [1, 1.05, 1],
          duration: 1.5,
          ease: "easeInOut"
        };
      case 'high':
        return {
          scale: [1, 1.08, 1],
          duration: 1,
          ease: "easeInOut"
        };
      default:
        return {
          scale: [1, 1.05, 1],
          duration: 1.5,
          ease: "easeInOut"
        };
    }
  };

  const animationConfig = getAnimationConfig();

  return (
    <motion.div
      className={className}
      animate={{
        scale: animationConfig.scale,
      }}
      transition={{
        duration: animationConfig.duration,
        ease: animationConfig.ease,
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
};
