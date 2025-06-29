
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(className)}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {loading ? (loadingText || children) : children}
    </Button>
  );
};
