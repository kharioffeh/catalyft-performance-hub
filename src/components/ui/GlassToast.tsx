
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface GlassToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-sky-400" />;
  }
};

const getToastColors = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-emerald-400/30 bg-emerald-500/10';
    case 'error':
      return 'border-red-400/30 bg-red-500/10';
    case 'warning':
      return 'border-amber-400/30 bg-amber-500/10';
    case 'info':
    default:
      return 'border-sky-400/30 bg-sky-500/10';
  }
};

export const GlassToast: React.FC<GlassToastProps> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, isPaused, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl backdrop-blur-md border shadow-lg',
        'bg-white/10 border-white/15 shadow-inner',
        getToastColors(toast.type),
        'max-w-sm w-full pointer-events-auto'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toast.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-white/80 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-white/60 hover:text-white/80" />
      </button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-xl"
        initial={{ width: '100%' }}
        animate={{ width: isPaused ? '100%' : '0%' }}
        transition={{ duration: isPaused ? 0 : duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
};
