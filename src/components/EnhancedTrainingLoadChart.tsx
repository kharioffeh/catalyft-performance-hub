
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui';
import { LoadGauge } from '@/components/Dashboard/LoadGauge';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

interface LoadData {
  athlete_uuid: string;
  day: string;
  daily_load: number;
  acute_7d: number;
  chronic_28d: number;
  acwr_7_28: number;
}

interface EnhancedTrainingLoadChartProps {
  data: LoadData[];
  variant?: 'default' | 'carousel';
  onLogWorkout?: () => void;
}

export const EnhancedTrainingLoadChart: React.FC<EnhancedTrainingLoadChartProps> = ({ 
  data, 
  variant = 'default',
  onLogWorkout 
}) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <Dumbbell className="w-12 h-12 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Training Data</h3>
        <p className="text-white/60 text-sm mb-4">
          Log workouts to see training load analysis
        </p>
        {onLogWorkout && (
          <Button onClick={onLogWorkout} variant="outline" size="sm">
            Log Workout
          </Button>
        )}
      </GlassCard>
    );
  }

  const latestData = data[data.length - 1];
  const currentLoad = latestData?.daily_load || 0;
  const currentACWR = latestData?.acwr_7_28 || 0;

  const getLoadLevel = (load: number) => {
    if (load <= 300) return 'Low';
    if (load <= 600) return 'Moderate';
    return 'High';
  };

  const getACWRRisk = (acwr: number) => {
    if (acwr >= 0.8 && acwr <= 1.3) return 'Optimal';
    if (acwr <= 1.5) return 'Caution';
    return 'High Risk';
  };

  const handleViewDetails = () => {
    navigate('/analytics/load');
  };

  // Generate upper/lower body split data from daily load
  const formattedData = data.map(item => {
    const totalLoad = item.daily_load || 0;
    // Estimate upper/lower split (could be enhanced with actual session data)
    const upperBody = totalLoad * 0.6; // 60% upper body (assumption)
    const lowerBody = totalLoad * 0.4; // 40% lower body (assumption)
    
    return {
      date: format(new Date(item.day), 'MMM dd'),
      upperBody,
      lowerBody,
      total: totalLoad,
      acwr: item.acwr_7_28 || 0
    };
  });

  return (
    <GlassCard className={`p-6 ${variant === 'carousel' ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Training Load & ACWR</h3>
          <p className="text-white/60 text-sm">Training load and injury risk analysis</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Training Load and ACWR Gauges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <LoadGauge value={currentLoad} size="regular" metric="load" />
            <div className="text-center mt-2">
              <div className="text-white/60 text-sm">Load Level</div>
              <div className={`font-medium ${
                currentLoad <= 300 ? 'text-green-400' :
                currentLoad <= 600 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {getLoadLevel(currentLoad)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <LoadGauge value={currentACWR} size="regular" metric="acwr" />
            <div className="text-center mt-2">
              <div className="text-white/60 text-sm">ACWR Risk</div>
              <div className={`font-medium ${
                currentACWR >= 0.8 && currentACWR <= 1.3 ? 'text-green-400' :
                currentACWR <= 1.5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {getACWRRisk(currentACWR)}
              </div>
            </div>
          </div>
        </div>

        {/* Upper/Lower Body Load Chart */}
        <div className="h-80 px-0 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                tick={{ fontSize: 8, dy: 3 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                height={15}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                tick={{ fontSize: 8, dx: -2 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                width={20}
                domain={[0, 20]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '11px'
                }}
                formatter={(value: any, name: string) => [`${value.toFixed(0)}`, name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="upperBody" fill="hsl(217, 91%, 60%)" name="Upper Body" />
              <Bar dataKey="lowerBody" fill="hsl(142, 76%, 36%)" name="Lower Body" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{currentLoad.toFixed(0)}</div>
          <div className="text-white/60 text-xs">Current Load</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            currentACWR >= 0.8 && currentACWR <= 1.3 ? 'text-green-400' :
            currentACWR <= 1.5 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {currentACWR.toFixed(2)}
          </div>
          <div className="text-white/60 text-xs">ACWR</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {latestData?.acute_7d?.toFixed(0) || 0}
          </div>
          <div className="text-white/60 text-xs">7-Day Acute</div>
        </div>
      </div>
    </GlassCard>
  );
};
