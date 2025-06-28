
import React from 'react';
import { Zap, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSessionAdjustments } from '@/hooks/useProgramAdjustments';
import { formatDistanceToNow } from 'date-fns';

interface SessionAdjustmentIndicatorProps {
  sessionId: string;
  showDetails?: boolean;
}

export const SessionAdjustmentIndicator: React.FC<SessionAdjustmentIndicatorProps> = ({ 
  sessionId, 
  showDetails = true 
}) => {
  const { data: adjustments, isLoading } = useSessionAdjustments(sessionId);

  if (isLoading || !adjustments || adjustments.length === 0) {
    return null;
  }

  const latestAdjustment = adjustments[0];
  const factor = latestAdjustment.adjustment_factor;
  const isIncrease = factor > 1;
  const isDecrease = factor < 1;
  const percentage = Math.abs((factor - 1) * 100);

  const getIcon = () => {
    if (isIncrease) return <TrendingUp className="h-3 w-3" />;
    if (isDecrease) return <TrendingDown className="h-3 w-3" />;
    return <Zap className="h-3 w-3" />;
  };

  const getVariant = () => {
    switch (latestAdjustment.reason) {
      case 'low_readiness':
      case 'over_strain':
        return 'destructive' as const;
      case 'high_readiness':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'low_readiness':
        return 'Low readiness';
      case 'high_readiness':
        return 'High readiness';
      case 'over_strain':
        return 'High strain';
      case 'under_strain':
        return 'Low strain';
      default:
        return 'Adjusted';
    }
  };

  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-medium">Auto-adjusted by ARIA</p>
      <p className="text-sm">
        {isIncrease ? 'Increased' : 'Decreased'} by {percentage.toFixed(1)}%
      </p>
      <p className="text-sm text-muted-foreground">
        Reason: {getReasonText(latestAdjustment.reason)}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(latestAdjustment.created_at), { addSuffix: true })}
      </p>
    </div>
  );

  if (!showDetails) {
    return (
      <div className="flex items-center">
        <Zap className="h-3 w-3 text-orange-500" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className="flex items-center gap-1 text-xs">
            {getIcon()}
            {isIncrease ? '+' : ''}{((factor - 1) * 100).toFixed(0)}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
