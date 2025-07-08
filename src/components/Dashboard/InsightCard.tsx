import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, TrendingUp, Moon, Activity, Dumbbell, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Insight } from '@/hooks/useInsights';

interface InsightCardProps {
  insight: Insight;
  index: number;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'readiness':
      return <Activity className="w-4 h-4" />;
    case 'sleep':
      return <Moon className="w-4 h-4" />;
    case 'load':
      return <Dumbbell className="w-4 h-4" />;
    case 'stress':
      return <Brain className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
};

const getSeverityColors = (severity: string) => {
  switch (severity) {
    case 'green':
      return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20';
    case 'amber':
      return 'border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20';
    case 'red':
      return 'border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20';
    default:
      return 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20';
  }
};

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-green-400" />;
    case 'down':
      return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
    default:
      return null;
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({ insight, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (insight.route) {
      navigate(insight.route);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] 
      }}
      className={cn(
        'relative flex-shrink-0 w-72 p-4 rounded-xl backdrop-blur-md border shadow-lg cursor-pointer',
        'bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300',
        'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        getSeverityColors(insight.severity)
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {getInsightIcon(insight.type)}
          </div>
          <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
            {insight.title}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {getTrendIcon(insight.trend)}
          {insight.value && (
            <span className="text-xs font-bold text-white">
              {insight.type === 'load' ? insight.value.toFixed(2) : Math.round(insight.value)}
              {insight.type === 'sleep' || insight.type === 'readiness' ? '%' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed text-white/90">
          {insight.message}
        </p>
      </div>

      {/* Severity indicator */}
      {insight.severity === 'red' && (
        <div className="absolute top-3 right-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
      )}

      {/* Click hint */}
      <div className="absolute bottom-2 right-2 opacity-50">
        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};