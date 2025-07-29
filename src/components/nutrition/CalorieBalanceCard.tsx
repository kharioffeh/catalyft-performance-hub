import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Activity,
  Utensils,
  Watch,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalorieBalanceProps {
  caloriesConsumed: number;
  caloriesBurned: number;
  bmr: number;
  totalExpenditure: number;
  balance: number;
  balancePercentage: number;
  dataSource?: 'whoop' | 'healthkit' | 'google_fit' | 'estimated' | 'none';
  isLoading?: boolean;
}

export const CalorieBalanceCard: React.FC<CalorieBalanceProps> = ({
  caloriesConsumed,
  caloriesBurned,
  bmr,
  totalExpenditure,
  balance,
  balancePercentage,
  dataSource = 'none',
  isLoading = false
}) => {
  const isDeficit = balance < 0;
  const isSurplus = balance > 0;
  const isBalanced = Math.abs(balance) <= 50; // Within 50 calories is considered balanced
  
  // Data source indicator
  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'whoop':
        return { label: 'WHOOP', color: 'text-purple-400', icon: Activity };
      case 'healthkit':
        return { label: 'Apple Watch', color: 'text-blue-400', icon: Watch };
      case 'google_fit':
        return { label: 'Google Fit', color: 'text-green-400', icon: Play };
      case 'estimated':
        return { label: 'Estimated', color: 'text-yellow-400', icon: Target };
      default:
        return { label: 'No Data', color: 'text-gray-400', icon: Target };
    }
  };
  
  const sourceInfo = getDataSourceInfo();

  const getBalanceColor = () => {
    if (isBalanced) return 'text-blue-400';
    if (isDeficit) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getBalanceBadgeColor = () => {
    if (isBalanced) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (isDeficit) return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  const getBalanceIcon = () => {
    if (isBalanced) return <Target className="w-4 h-4" />;
    if (isDeficit) return <TrendingDown className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const getBalanceMessage = () => {
    if (isBalanced) return 'Balanced';
    if (isDeficit) return `${Math.abs(balance)} cal deficit`;
    return `${balance} cal surplus`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Flame className="w-5 h-5" />
            Calorie Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const consumedPercentage = totalExpenditure > 0 ? (caloriesConsumed / totalExpenditure) * 100 : 0;
  const maxWidth = Math.max(consumedPercentage, 100);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Flame className="w-5 h-5" />
            Calorie Balance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn("border text-xs", sourceInfo.color.replace('text-', 'border-').replace('-400', '-500/30'), sourceInfo.color.replace('text-', 'bg-').replace('-400', '-500/20'))}>
              <sourceInfo.icon className="w-3 h-3 mr-1" />
              {sourceInfo.label}
            </Badge>
            <Badge className={cn("border", getBalanceBadgeColor())}>
              {getBalanceIcon()}
              <span className="ml-1">{getBalanceMessage()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center">
          <div className={cn("text-3xl font-bold mb-1", getBalanceColor())}>
            {balance > 0 ? '+' : ''}{balance.toLocaleString()}
          </div>
          <div className="text-sm text-white/70">
            {balancePercentage > 0 ? '+' : ''}{balancePercentage.toFixed(1)}% of expenditure
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span className="flex items-center gap-1">
                <Utensils className="w-3 h-3" />
                Consumed
              </span>
              <span>{caloriesConsumed.toLocaleString()} kcal</span>
            </div>
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                style={{ width: `${Math.min(consumedPercentage, 100)}%` }}
              />
              {consumedPercentage > 100 && (
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-red-600 to-red-700 opacity-80"
                  style={{ 
                    left: '100%',
                    width: `${Math.min(consumedPercentage - 100, 50)}%`
                  }}
                />
              )}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Burned
              </span>
              <span>{totalExpenditure.toLocaleString()} kcal</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-full" />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm text-white/70 mb-1">BMR</div>
            <div className="text-lg font-semibold text-white">{bmr.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/70 mb-1">Activity</div>
            <div className="text-lg font-semibold text-white">{caloriesBurned.toLocaleString()}</div>
          </div>
        </div>

        {/* Health Tips */}
        {(Math.abs(balancePercentage) > 25) && (
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-white/70">
              {isDeficit && Math.abs(balancePercentage) > 25 && (
                <>💡 Large deficit detected. Consider increasing calorie intake if not intentional.</>
              )}
              {isSurplus && balancePercentage > 25 && (
                <>💡 Calorie surplus detected. Great for muscle building or consider increasing activity.</>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};