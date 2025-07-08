import React from 'react';
import { GlassCard } from '@/components/ui';
import { StressData } from '@/hooks/useStress';
import { format, parseISO } from 'date-fns';

interface TableViewProps {
  data: StressData | undefined;
  period: number;
  isLoading: boolean;
}

export const TableView: React.FC<TableViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStressLevelColor = (value: number) => {
    if (value <= 30) return 'text-green-400';
    if (value <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStressLevel = (value: number) => {
    if (value <= 30) return 'Low';
    if (value <= 60) return 'Moderate';
    return 'High';
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 2) return { icon: '→', color: 'text-white/60', text: 'Stable' };
    if (diff > 0) return { icon: '↑', color: 'text-red-400', text: `+${diff.toFixed(0)}` };
    return { icon: '↓', color: 'text-green-400', text: `${diff.toFixed(0)}` };
  };

  // Generate enriched data with additional metrics
  const enrichedData = data.dailyReadings.map((reading, index) => {
    const previousReading = index > 0 ? data.dailyReadings[index - 1] : reading;
    const change = getChangeIndicator(reading.value, previousReading.value);
    
    return {
      ...reading,
      level: getStressLevel(reading.value),
      change,
      formattedDate: format(parseISO(reading.date), 'MMM dd, yyyy'),
      dayOfWeek: format(parseISO(reading.date), 'EEEE')
    };
  }).reverse(); // Show most recent first

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-lg font-bold text-white">{data.current}</div>
          <div className="text-white/60 text-sm">Current</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-lg font-bold text-white">{data.average7d}</div>
          <div className="text-white/60 text-sm">7-Day Avg</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-lg font-bold text-white">
            {Math.max(...data.dailyReadings.map(r => r.value))}
          </div>
          <div className="text-white/60 text-sm">Peak</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-lg font-bold text-white">
            {Math.min(...data.dailyReadings.map(r => r.value))}
          </div>
          <div className="text-white/60 text-sm">Lowest</div>
        </GlassCard>
      </div>

      {/* Detailed Table */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Stress Records</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-white/70 font-medium">Date</th>
                <th className="text-left py-3 text-white/70 font-medium">Day</th>
                <th className="text-center py-3 text-white/70 font-medium">Stress Level</th>
                <th className="text-center py-3 text-white/70 font-medium">Category</th>
                <th className="text-center py-3 text-white/70 font-medium">Change</th>
                <th className="text-left py-3 text-white/70 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {enrichedData.map((reading, index) => (
                <tr key={reading.date} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 text-white">
                    {reading.formattedDate}
                  </td>
                  <td className="py-4 text-white/70">
                    {reading.dayOfWeek}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`font-bold ${getStressLevelColor(reading.value)}`}>
                      {reading.value}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reading.level === 'Low' ? 'bg-green-400/20 text-green-400' :
                      reading.level === 'Moderate' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {reading.level}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`flex items-center justify-center gap-1 ${reading.change.color}`}>
                      <span>{reading.change.icon}</span>
                      <span className="text-xs">{reading.change.text}</span>
                    </span>
                  </td>
                  <td className="py-4 text-white/60 text-sm">
                    {reading.value > 70 ? 'High stress - focus on recovery' :
                     reading.value > 50 ? 'Moderate stress - monitor closely' :
                     'Good stress level - maintain routine'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Weekly Pattern Analysis */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Weekly Stress Patterns</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            // Calculate average stress for each day of week
            const dayAverage = data.dailyReadings
              .filter(reading => format(parseISO(reading.date), 'EEE') === day)
              .reduce((sum, reading, _, arr) => sum + reading.value / arr.length, 0);
            
            return (
              <div key={day} className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-white/70 text-sm mb-1">{day}</div>
                <div className={`font-bold ${getStressLevelColor(dayAverage || 0)}`}>
                  {Math.round(dayAverage) || '--'}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};