
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  console.error('AppLayout Error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-white/70 mb-4 text-sm">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button 
            onClick={resetErrorBoundary} 
            className="bg-indigo-500/90 hover:bg-indigo-500 text-white backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};
