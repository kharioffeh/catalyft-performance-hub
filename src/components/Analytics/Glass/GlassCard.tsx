
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  title?: string;
  value?: string;
  delta?: string;
  trend?: "up" | "down";
  accent?: "sleep" | "load" | "strain";
  children?: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  value,
  delta,
  trend,
  accent,
  children,
  className
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'sleep': return 'border-blue-400/30';
      case 'load': return 'border-purple-400/30';
      case 'strain': return 'border-orange-400/30';
      default: return 'border-white/20';
    }
  };

  return (
    <div className={cn(
      "rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-xl p-5 transition-all hover:bg-white/10",
      getAccentColor(),
      className
    )}>
      {title && (
        <p className="text-xs mb-1 tracking-wide text-white/70 uppercase font-medium">
          {title}
        </p>
      )}
      {value && (
        <p className="text-2xl font-semibold text-white mb-1">
          {value}
        </p>
      )}
      {delta && trend && (
        <p className={cn(
          "text-xs flex items-center gap-1 font-medium",
          trend === "up" ? "text-emerald-400" : "text-rose-400"
        )}>
          {trend === "up" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {delta} vs 7d
        </p>
      )}
      {children}
    </div>
  );
};
