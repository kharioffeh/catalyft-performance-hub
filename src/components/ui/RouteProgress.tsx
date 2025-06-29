
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export const RouteProgress: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.3,
            ease: 'easeInOut'
          }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 backdrop-blur-xl z-50 origin-left"
        />
      )}
    </AnimatePresence>
  );
};
