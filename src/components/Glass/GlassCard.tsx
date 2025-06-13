
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  title?: string;
  value?: string;
  delta?: string;
  trend?: "up" | "down";
  accent?: "sleep" | "load" | "strain" | "primary" | "secondary";
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  shadowLevel?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: "glass" | "flat";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  value,
  delta,
  trend,
  accent,
  children,
  className,
  onClick,
  shadowLevel = 'md',
  tone = 'glass'
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case 'sleep': return 'border-blue-400/30 hover:border-blue-400/50';
      case 'load': return 'border-purple-400/30 hover:border-purple-400/50';
      case 'strain': return 'border-orange-400/30 hover:border-orange-400/50';
      case 'primary': return 'border-indigo-400/30 hover:border-indigo-400/50';
      case 'secondary': return 'border-emerald-400/30 hover:border-emerald-400/50';
      default: return 'border-white/10 hover:border-white/20';
    }
  };

  const getToneStyles = () => {
    if (tone === 'flat') {
      return 'bg-transparent border-transparent shadow-none';
    }
    return 'bg-slate-900/40 backdrop-blur-lg border shadow-glass hover:bg-slate-900/50';
  };

  return (
    <div 
      className={cn(
        "rounded-2xl transition-all duration-300 p-5 cursor-pointer",
        getToneStyles(),
        tone !== 'flat' && getAccentColor(),
        onClick && "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
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
