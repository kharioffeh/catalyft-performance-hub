
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      case 'amber':
        return <AlertCircle className="w-3 h-3 text-yellow-600" />;
      default:
        return <Info className="w-3 h-3 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'amber':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (profile?.role !== 'coach') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <CardTitle>ARIA Insights</CardTitle>
        </div>
        <CardDescription>AI-generated insights for today</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        ) : Object.keys(insightsByAthlete).length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No insights generated today
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(insightsByAthlete).map(([athleteUuid, athleteInsights]) => (
              <div key={athleteUuid} className="border-l-2 border-gray-200 pl-3">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {athleteInsights[0]?.athlete_name}
                </div>
                <div className="space-y-1">
                  {athleteInsights.slice(0, 2).map((insight) => (
                    <div key={insight.id} className="flex items-start space-x-2">
                      {getSeverityIcon(insight.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(insight.severity)}`}
                          >
                            {insight.metric}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {athleteInsights.length > 2 && (
                    <div className="text-xs text-gray-500 ml-5">
                      +{athleteInsights.length - 2} more insights
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
