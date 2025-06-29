
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'ghost' | 'destructive';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'ghost',
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={cn(
        'p-1.5 rounded-lg transition-colors',
        variant === 'destructive'
          ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
          : 'hover:bg-white/10 text-white/70 hover:text-white',
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
