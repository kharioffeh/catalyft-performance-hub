
import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface GlassButtonProps extends ButtonProps {
  glassVariant?: 'primary' | 'secondary' | 'ghost';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  className,
  glassVariant = 'primary',
  children,
  ...props
}) => {
  const getGlassStyles = () => {
    switch (glassVariant) {
      case 'primary':
        return 'bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-md shadow-lg';
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 backdrop-blur-md shadow-md';
      case 'ghost':
        return 'bg-transparent hover:bg-white/10 border border-white/10 text-white/80 backdrop-blur-sm';
      default:
        return 'bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-md shadow-lg';
    }
  };

  return (
    <Button
      className={cn(
        getGlassStyles(),
        "transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
