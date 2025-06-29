
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { cn } from '@/lib/utils';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  errorFallback?: React.ComponentType<any>;
}

const DefaultErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="bg-glass-card-light/60 dark:bg-glass-card-dark/80 backdrop-blur-lg border border-red-400/30 rounded-xl p-6 text-center">
    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 dark:text-white/70 mb-4">
      {error.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Try again
    </button>
  </div>
);

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  className,
  errorFallback: ErrorFallback = DefaultErrorFallback,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
