
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface ForecastData {
  week: string;
  probability: number;
  color: string;
}

export const InjuryForecastCard: React.FC<{ athleteId?: string }> = ({ athleteId }) => {
  const { profile } = useAuth();
  const targetAthleteId = athleteId || profile?.id;

  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['injuryForecast', targetAthleteId],
    queryFn: async () => {
      if (!targetAthleteId) return null;

      const { data, error } = await supabase
        .from('injury_risk_forecast')
        .select('probabilities, forecast_date')
        .eq('athlete_uuid', targetAthleteId)
        .order('forecast_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!targetAthleteId
  });

  const chartData: ForecastData[] = React.useMemo(() => {
    if (!forecastData?.probabilities) return [];

    const probabilities = forecastData.probabilities as any;
    return [
      { 
        week: 'Week 1', 
        probability: Math.round((probabilities['1_week'] || 0) * 100),
        color: probabilities['1_week'] > 0.3 ? '#ef4444' : probabilities['1_week'] > 0.15 ? '#f59e0b' : '#10b981'
      },
      { 
        week: 'Week 2', 
        probability: Math.round((probabilities['2_week'] || 0) * 100),
        color: probabilities['2_week'] > 0.3 ? '#ef4444' : probabilities['2_week'] > 0.15 ? '#f59e0b' : '#10b981'
      },
      { 
        week: 'Week 3', 
        probability: Math.round((probabilities['3_week'] || 0) * 100),
        color: probabilities['3_week'] > 0.3 ? '#ef4444' : probabilities['3_week'] > 0.15 ? '#f59e0b' : '#10b981'
      },
      { 
        week: 'Week 4', 
        probability: Math.round((probabilities['4_week'] || 0) * 100),
        color: probabilities['4_week'] > 0.3 ? '#ef4444' : probabilities['4_week'] > 0.15 ? '#f59e0b' : '#10b981'
      }
    ];
  }, [forecastData]);

  const maxRisk = Math.max(...chartData.map(d => d.probability));
  const riskLevel = maxRisk > 30 ? 'High' : maxRisk > 15 ? 'Moderate' : 'Low';
  const riskColor = maxRisk > 30 ? 'text-red-600' : maxRisk > 15 ? 'text-yellow-600' : 'text-green-600';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle>Injury Risk Forecast</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle>Injury Risk Forecast</CardTitle>
          </div>
          <CardDescription>No forecast data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Forecast will be available after sufficient training data is collected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <CardTitle>Injury Risk Forecast</CardTitle>
        </div>
        <CardDescription>
          Current risk level: <span className={`font-semibold ${riskColor}`}>{riskLevel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 50]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Injury Risk']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="probability" 
                fill="#f59e0b"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Updated: {new Date(forecastData.forecast_date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
