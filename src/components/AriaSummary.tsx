
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Insight {
  id: string;
  athlete_uuid: string;
  metric: string;
  severity: 'info' | 'amber' | 'red';
  message: string;
  created_at: string;
  athlete_name?: string;
}

export const AriaSummary: React.FC = () => {
  const { profile } = useAuth();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['dailyInsights_unified', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile.role !== 'coach') return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('ai_insights')
        .select(`
          id,
          athlete_uuid,
          coach_uuid,
          created_at,
          json,
          athletes!inner(name)
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // json: { message, metric, severity, source }
      return (data ?? []).map(item => {
        const insightJson = item.json as { message: string; metric: string; severity: 'info' | 'amber' | 'red'; source?: string };
        return {
          id: item.id,
          athlete_uuid: item.athlete_uuid,
          metric: insightJson.metric,
          severity: insightJson.severity,
          message: insightJson.message,
          created_at: item.created_at,
          athlete_name: item.athletes?.name,
        };
      });
    },
    enabled: !!profile?.id && profile?.role === 'coach'
  });

  // Group insights by athlete
  const insightsByAthlete = React.useMemo(() => {
    const grouped: Record<string, Insight[]> = {};
    insights.forEach(insight => {
      if (!grouped[insight.athlete_uuid]) {
        grouped[insight.athlete_uuid] = [];
      }
      grouped[insight.athlete_uuid].push(insight);
    });
    return grouped;
  }, [insights]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'red':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      case 'amber':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      default:
        return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'amber':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    }
  };

  if (profile?.role !== 'coach') {
    return null;
  }

  return (
    <div className="glass-card p-6 min-h-[18rem]">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">ARIA Insights</h3>
      </div>
      <p className="text-sm text-white/60 mb-6">AI-generated insights for today</p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
        </div>
      ) : Object.keys(insightsByAthlete).length === 0 ? (
        <div className="text-center text-white/50 py-8">
          <Brain className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <p className="text-white/70">No insights generated today</p>
          <p className="text-sm text-white/50">Check back later for AI-generated recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(insightsByAthlete).map(([athleteUuid, athleteInsights]) => (
            <div key={athleteUuid} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-3">
                {athleteInsights[0]?.athlete_name}
              </div>
              <div className="space-y-3">
                {athleteInsights.slice(0, 2).map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-3">
                    {getSeverityIcon(insight.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(insight.severity)}`}
                        >
                          {insight.metric}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                ))}
                {athleteInsights.length > 2 && (
                  <div className="text-xs text-white/50 ml-5">
                    +{athleteInsights.length - 2} more insights
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
