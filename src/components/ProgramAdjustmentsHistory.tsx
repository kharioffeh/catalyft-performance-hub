
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { useProgramAdjustments, useAdjustmentStats } from '@/hooks/useProgramAdjustments';
import { formatDistanceToNow, format } from 'date-fns';

interface ProgramAdjustmentsHistoryProps {
  athleteId?: string;
  showStats?: boolean;
}

export const ProgramAdjustmentsHistory: React.FC<ProgramAdjustmentsHistoryProps> = ({ 
  athleteId, 
  showStats = true 
}) => {
  const { data: adjustments, isLoading } = useProgramAdjustments(athleteId);
  const { data: stats } = useAdjustmentStats(athleteId);

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'low_readiness':
        return 'bg-red-100 text-red-800';
      case 'over_strain':
        return 'bg-orange-100 text-orange-800';
      case 'high_readiness':
        return 'bg-green-100 text-green-800';
      case 'under_strain':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'low_readiness':
        return 'Low Readiness';
      case 'high_readiness':
        return 'High Readiness';
      case 'over_strain':
        return 'High Strain';
      case 'under_strain':
        return 'Low Strain';
      default:
        return 'Adjusted';
    }
  };

  const getAdjustmentIcon = (factor: number) => {
    if (factor > 1) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (factor < 1) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Zap className="h-4 w-4 text-orange-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Program Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Adjustment Statistics (Last 30 Days)
            </CardTitle>
            <CardDescription>
              ARIA has automatically adjusted your training program based on readiness and strain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Adjustments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.byReason.low_readiness + stats.byReason.over_strain}</div>
                <div className="text-sm text-muted-foreground">Intensity Reduced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.byReason.high_readiness}</div>
                <div className="text-sm text-muted-foreground">Intensity Increased</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{((stats.avgAdjustment - 1) * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Adjustment</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Adjustments
          </CardTitle>
          <CardDescription>
            History of automatic program adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!adjustments || adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No program adjustments yet</p>
              <p className="text-sm">ARIA will automatically adjust your sessions based on readiness and strain</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adjustments.map((adjustment) => {
                const factor = adjustment.adjustment_factor;
                const percentage = ((factor - 1) * 100);
                const isIncrease = factor > 1;
                
                return (
                  <div key={adjustment.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getAdjustmentIcon(factor)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Session {isIncrease ? 'intensified' : 'reduced'} by {Math.abs(percentage).toFixed(1)}%
                          </span>
                          <Badge className={getReasonColor(adjustment.reason)}>
                            {getReasonText(adjustment.reason)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(adjustment.created_at), 'MMM d, yyyy')} • 
                          {formatDistanceToNow(new Date(adjustment.created_at), { addSuffix: true })}
                        </p>
                        {adjustment.old_payload && adjustment.new_payload && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Before:</span>
                                {Object.entries(adjustment.old_payload).map(([key, value]) => (
                                  <div key={key}>{key}: {String(value)}</div>
                                ))}
                              </div>
                              <div>
                                <span className="font-medium">After:</span>
                                {Object.entries(adjustment.new_payload).map(([key, value]) => (
                                  <div key={key}>{key}: {String(value)}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
