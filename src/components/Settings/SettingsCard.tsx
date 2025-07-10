
import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDangerous?: boolean;
  disabled?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  rightElement,
  isDangerous = false,
  disabled = false
}) => {
  const isClickable = !!onPress && !disabled;

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "w-full flex items-center min-h-[44px] p-4 bg-white rounded-2xl shadow-md",
        "transition-all duration-200 touch-manipulation border border-gray-100",
        isClickable && "hover:bg-gray-50 active:scale-[0.98] hover:shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        isDangerous && "border-[#DC2626]/20 bg-red-50/50"
      )}
      style={{ touchAction: 'manipulation' }}
    >
      <Icon 
        className={cn(
          "w-6 h-6 mr-3 flex-shrink-0",
          isDangerous ? "text-[#DC2626]" : "text-gray-600"
        )} 
      />
      
      <div className="flex-1 text-left">
        <div className={cn(
          "text-base font-medium",
          isDangerous ? "text-[#DC2626]" : "text-gray-900"
        )}>
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-500 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 ml-3">
        {rightElement || (isClickable && <ChevronRight className="w-5 h-5 text-gray-400" />)}
      </div>
    </button>
  );
};
