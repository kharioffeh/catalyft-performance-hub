import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabProps {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  icon?: React.ReactNode;
}

export const Fab: React.FC<FabProps> = ({
  onPress,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Add new item',
  icon
}) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        // Fixed positioning
        "fixed bottom-6 right-6 z-50",
        // Size: 64px (w-16 h-16)
        "w-16 h-16",
        // Background and styling
        "bg-[#2563EB] rounded-full shadow-lg",
        // Interactions
        "hover:bg-[#1d4ed8] active:scale-95",
        "transition-all duration-200",
        // Text and flex
        "text-white flex items-center justify-center",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed hover:bg-[#2563EB]",
        className
      )}
      aria-label={ariaLabel}
    >
      {icon || <Plus className="w-6 h-6" />}
    </button>
  );
};