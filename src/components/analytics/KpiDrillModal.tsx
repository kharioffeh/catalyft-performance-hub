
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Moon, Target, Zap, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { chartTheme } from '@/lib/chartTheme';
import { getMetricColor, MetricType } from '@/lib/metricTokens';

interface KpiDrillModalProps {
  metric: 'readiness' | 'sleep' | 'load' | 'strain';
  isOpen: boolean;
  onClose: () => void;
  athleteId?: string;
}

interface DrillDownData {
  date: string;
  value: number;
  label: string;
}

const getMetricIcon = (metric: string) => {
  switch (metric) {
    case 'readiness': return Activity;
    case 'sleep': return Moon;
    case 'load': return Target;
    case 'strain': return Zap;
    default: return Activity;
  }
};

const getMetricUnit = (metric: string) => {
  switch (metric) {
    case 'readiness': return '%';
    case 'sleep': return 'h';
    case 'load': return '';
    case 'strain': return '';
    default: return '';
  }
};

const generateMockData = (metric: string, period: '24h' | '7d'): DrillDownData[] => {
  const days = period === '24h' ? 1 : 7;
  const intervals = period === '24h' ? 24 : 7;
  
  return Array.from({ length: intervals }, (_, i) => {
    const date = subDays(new Date(), days - 1).getTime() + (i * (period === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    
    let value: number;
    switch (metric) {
      case 'readiness':
        value = 70 + Math.random() * 25;
        break;
      case 'sleep':
        value = 6.5 + Math.random() * 2;
        break;
      case 'load':
        value = 300 + Math.random() * 200;
        break;
      case 'strain':
        value = 12 + Math.random() * 8;
        break;
      default:
        value = Math.random() * 100;
    }
    
    return {
      date: format(new Date(date), period === '24h' ? 'HH:mm' : 'MMM dd'),
      value: Math.round(value * 10) / 10,
      label: format(new Date(date), period === '24h' ? 'HH:mm' : 'EEE')
    };
  });
};

const generateInsights = (metric: string, data: DrillDownData[]): string[] => {
  const latest = data[data.length - 1]?.value || 0;
  const average = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const trend = latest > average ? 'above' : 'below';
  
  const insights: Record<string, string[]> = {
    readiness: [
      `Current readiness is ${trend} your recent average (${average.toFixed(1)}%)`,
      latest > 80 ? 'Excellent recovery - ready for high intensity' : 'Consider lighter training today',
      `Peak readiness was ${Math.max(...data.map(d => d.value)).toFixed(1)}% this period`
    ],
    sleep: [
      `Sleep duration is ${trend} your recent average (${average.toFixed(1)}h)`,
      latest < 7 ? 'Consider earlier bedtime tonight' : 'Good sleep consistency',
      `Best sleep was ${Math.max(...data.map(d => d.value)).toFixed(1)}h this period`
    ],
    load: [
      `Training load is ${trend} your recent average (${average.toFixed(0)})`,
      latest > average * 1.3 ? 'High load - monitor recovery closely' : 'Load within normal range',
      `Peak load was ${Math.max(...data.map(d => d.value)).toFixed(0)} this period`
    ],
    strain: [
      `Strain is ${trend} your recent average (${average.toFixed(1)})`,
      latest > 18 ? 'High strain detected - prioritize recovery' : 'Strain levels manageable',
      `Peak strain was ${Math.max(...data.map(d => d.value)).toFixed(1)} this period`
    ]
  };
  
  return insights[metric] || [];
};

export const KpiDrillModal: React.FC<KpiDrillModalProps> = ({
  metric,
  isOpen,
  onClose,
  athleteId
}) => {
  const [period, setPeriod] = useState<'24h' | '7d'>('7d');
  
  const data = useMemo(() => generateMockData(metric, period), [metric, period]);
  const insights = useMemo(() => generateInsights(metric, data), [metric, data]);
  
  const Icon = getMetricIcon(metric);
  const unit = getMetricUnit(metric);
  const color = getMetricColor(metric as MetricType, 'primary');
  
  const chartData = {
    datasets: [{
      data: data.map(d => d.value),
      borderColor: color,
      backgroundColor: `${color}20`,
      pointBackgroundColor: color,
      pointBorderColor: color,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
    }],
    labels: data.map(d => d.label)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-glass max-w-md w-[90vw] p-0 border-white/10">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <DialogTitle className="text-lg font-semibold text-white capitalize">
                  {metric} Breakdown
                </DialogTitle>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </DialogHeader>

          {/* Period Toggle */}
          <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-lg">
            {(['24h', '7d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-40 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [`${value}${unit}`, metric]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="space-y-2 mb-6">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-white/80">
                <div className="w-1 h-1 rounded-full bg-white/40 mt-2 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-500/90 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
