import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFabPosition } from '@/hooks/useFabPosition';

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
  const { fabClasses } = useFabPosition();

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        // Smart positioning based on screen size and layout
        fabClasses,
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