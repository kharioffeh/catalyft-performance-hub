import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

interface DailyCalorieData {
  date: string;
  caloriesConsumed: number;
  totalExpenditure: number;
  balance: number;
}

interface CalorieTrendChartProps {
  weeklyData: DailyCalorieData[];
  isLoading?: boolean;
}

export const CalorieTrendChart: React.FC<CalorieTrendChartProps> = ({
  weeklyData,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-32 bg-white/10 rounded"></div>
            <div className="h-8 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-white/70">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data (reverse to show oldest to newest)
  const sortedData = [...weeklyData].reverse();
  
  // Find max value for scaling
  const maxValue = Math.max(
    ...sortedData.map(d => Math.max(d.caloriesConsumed, d.totalExpenditure))
  );
  const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;

  // Calculate average balance
  const avgBalance = weeklyData.reduce((sum, day) => sum + day.balance, 0) / weeklyData.length;
  const avgBalanceColor = avgBalance < -50 ? 'text-green-400' : avgBalance > 50 ? 'text-yellow-400' : 'text-blue-400';

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Weekly Trend
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-white/70">Avg Balance</div>
            <div className={`text-sm font-semibold ${avgBalanceColor}`}>
              {avgBalance > 0 ? '+' : ''}{Math.round(avgBalance)} kcal
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="relative h-32">
          <div className="flex items-end justify-between h-full gap-1">
            {sortedData.map((day, index) => {
              const consumedHeight = (day.caloriesConsumed * scaleFactor);
              const expenditureHeight = (day.totalExpenditure * scaleFactor);
              const isDeficit = day.balance < 0;
              const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center group">
                  {/* Bars */}
                  <div className="relative w-full h-28 flex items-end justify-center gap-0.5">
                    {/* Expenditure bar (background) */}
                    <div 
                      className="w-3 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t opacity-60"
                      style={{ height: `${expenditureHeight}%` }}
                    />
                    
                    {/* Consumed bar (foreground) */}
                    <div 
                      className={`w-3 rounded-t ${
                        day.caloriesConsumed > day.totalExpenditure 
                          ? 'bg-gradient-to-t from-red-500 to-orange-500' 
                          : 'bg-gradient-to-t from-orange-500 to-yellow-500'
                      }`}
                      style={{ height: `${consumedHeight}%` }}
                    />
                  </div>
                  
                  {/* Day label */}
                  <div className="text-xs text-white/70 mt-1">{dayName}</div>
                  
                  {/* Balance indicator */}
                  <div className={`text-xs font-medium ${
                    isDeficit ? 'text-green-400' : day.balance > 50 ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {day.balance > 0 ? '+' : ''}{Math.round(day.balance)}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    <div>In: {day.caloriesConsumed.toLocaleString()}</div>
                    <div>Out: {day.totalExpenditure.toLocaleString()}</div>
                    <div className={isDeficit ? 'text-green-300' : 'text-yellow-300'}>
                      {day.balance > 0 ? '+' : ''}{day.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded"></div>
            <span>Consumed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-60"></div>
            <span>Burned</span>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm text-white/70 mb-1">Total In</div>
            <div className="text-lg font-semibold text-orange-400">
              {weeklyData.reduce((sum, day) => sum + day.caloriesConsumed, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/70 mb-1">Total Out</div>
            <div className="text-lg font-semibold text-blue-400">
              {weeklyData.reduce((sum, day) => sum + day.totalExpenditure, 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/70 mb-1">Net</div>
            <div className={`text-lg font-semibold ${avgBalanceColor}`}>
              {weeklyData.reduce((sum, day) => sum + day.balance, 0) > 0 ? '+' : ''}
              {weeklyData.reduce((sum, day) => sum + day.balance, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};