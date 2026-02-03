import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui';

interface InjuryForecast {
  id: string;
  athlete_uuid: string;
  probabilities: {
    risk_level: 'low' | 'medium' | 'high';
    risk_score: number;
    body_part: string;
    recommendation: string;
  };
  created_at: string;
  athlete_name?: string;
}

export const InjuryForecastCard: React.FC = () => {
  const { profile } = useAuth();

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ['injuryForecasts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('injury_risk_forecast')
        .select(`
          id,
          athlete_uuid,
          probabilities,
          created_at,
          athletes!inner(name)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map(item => {
        const probs = item.probabilities as Record<string, unknown> | null;
        const athletes = item.athletes as { name?: string } | null;
        return {
          id: item.id,
          athlete_uuid: item.athlete_uuid,
          probabilities: {
            risk_level: (probs?.risk_level as string) || 'low',
            risk_score: (probs?.risk_score as number) || 0,
            body_part: (probs?.body_part as string) || 'General',
            recommendation: (probs?.recommendation as string) || 'Continue monitoring'
          },
          created_at: item.created_at,
          athlete_name: athletes?.name,
        };
      });
    },
    enabled: false // Injury forecast disabled for solo users
  });

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-green-400" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      default:
        return 'bg-green-500/20 text-green-300 border-green-400/30';
    }
  };

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500/10 border-red-400/20';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-400/20';
      default:
        return 'bg-green-500/10 border-green-400/20';
    }
  };



  return (
    <GlassCard className="p-6 min-h-[220px]">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Injury Risk Forecast</h3>
      </div>
      <p className="text-sm text-white/60 mb-6">AI-powered injury risk predictions</p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
        </div>
      ) : forecasts.length === 0 ? (
        <div className="text-center text-white/50 py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <p className="text-white/70">No injury risks detected</p>
          <p className="text-sm text-white/50">You're looking good</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forecasts.slice(0, 3).map((forecast) => (
            <div key={forecast.id} className={`border rounded-xl p-4 ${getRiskBgColor(forecast.probabilities.risk_level)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white">
                  {forecast.athlete_name}
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRiskColor(forecast.probabilities.risk_level)}`}
                >
                  {forecast.probabilities.risk_level} risk
                </Badge>
              </div>
              
              <div className="flex items-start space-x-3">
                {getRiskIcon(forecast.probabilities.risk_level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-white/80 font-medium">
                      {forecast.probabilities.body_part}
                    </span>
                    <span className="text-xs text-white/60">
                      {Math.round(forecast.probabilities.risk_score * 100)}% risk
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {forecast.probabilities.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {forecasts.length > 3 && (
            <div className="text-xs text-white/50 text-center pt-2">
              +{forecasts.length - 3} more forecasts
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
