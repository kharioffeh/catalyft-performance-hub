
import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 18, className }) => {
  return (
    <svg
      className={cn("animate-spin text-cyan-400", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M22 12a10 10 0 0 1-10 10V20a8 8 0 0 0 8-8h2z"
        fill="currentColor" 
      />
    </svg>
  );
};
