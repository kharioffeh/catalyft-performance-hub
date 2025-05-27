
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AthleteModalAnimationProps {
  isOpen: boolean;
  isMobile: boolean;
  children: React.ReactNode;
}

export const AthleteModalAnimation: React.FC<AthleteModalAnimationProps> = ({
  isOpen,
  isMobile,
  children,
}) => {
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }
    },
    exit: { 
      opacity: 0, 
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      transition: {
        duration: 0.2,
      }
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="h-full flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
