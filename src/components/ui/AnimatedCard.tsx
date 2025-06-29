
import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className
}) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.32, 0.72, 0, 1]
      }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
