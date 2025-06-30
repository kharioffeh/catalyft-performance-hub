
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false
}) => {
  return (
    <div className="flex items-center min-h-[44px] min-w-[44px] justify-center">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "scale-110", // Ensures proper touch target size
          disabled && "opacity-50"
        )}
      />
    </div>
  );
};
