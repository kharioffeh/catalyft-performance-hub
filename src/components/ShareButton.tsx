
import React from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  onClick, 
  className,
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white',
        'bg-white/5 hover:bg-white/10 rounded-lg transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  );
};
