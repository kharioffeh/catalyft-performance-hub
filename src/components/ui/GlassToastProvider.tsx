
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GlassToast, Toast, ToastType } from './GlassToast';

interface ToastContextType {
  push: (type: ToastType, title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface GlassToastProviderProps {
  children: React.ReactNode;
}

export const GlassToastProvider: React.FC<GlassToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    push('success', title, message, duration);
  }, [push]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    push('error', title, message, duration);
  }, [push]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    push('warning', title, message, duration);
  }, [push]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    push('info', title, message, duration);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push, dismiss, clear, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 pointer-events-none sm:bottom-4 sm:right-4 max-sm:bottom-4 max-sm:left-4 max-sm:right-4">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <GlassToast
              key={toast.id}
              toast={toast}
              onDismiss={dismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useGlassToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlassToast must be used within a GlassToastProvider');
  }
  return context;
};
