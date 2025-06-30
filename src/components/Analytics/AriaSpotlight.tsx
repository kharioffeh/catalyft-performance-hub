
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Moon, BarChart, HeartHandshake, X } from 'lucide-react';

interface Insight {
  id: string;
  athlete_uuid: string;
  metric: string;
  severity: 'info' | 'amber' | 'red';
  message: string;
  created_at: string;
}

// Type guard to validate severity
const isValidSeverity = (severity: string): severity is 'info' | 'amber' | 'red' => {
  return ['info', 'amber', 'red'].includes(severity);
};

// Transform database row to Insight interface
const transformToInsight = (row: any): Insight | null => {
  if (!row || !isValidSeverity(row.severity)) {
    return null;
  }
  
  return {
    id: row.id,
    athlete_uuid: row.athlete_uuid,
    metric: row.metric,
    severity: row.severity,
    message: row.message,
    created_at: row.created_at
  };
};

export const AriaSpotlight: React.FC = () => {
  const { profile } = useAuth();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    // Fetch latest insight for current user
    const fetchLatestInsight = async () => {
      const { data, error } = await supabase
        .from('insight_log')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const transformedInsight = transformToInsight(data);
        if (transformedInsight) {
          setInsight(transformedInsight);
          setIsVisible(true);
        }
      }
    };

    fetchLatestInsight();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('aria-insights-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'insight_log',
          filter: `athlete_uuid=eq.${profile.id}`
        },
        (payload) => {
          const transformedInsight = transformToInsight(payload.new);
          if (transformedInsight) {
            setInsight(transformedInsight);
            setIsVisible(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  useEffect(() => {
    if (isVisible && insight) {
      // Auto-dismiss after 25 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 25000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, insight]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!insight || !isVisible) return null;

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sleep':
        return <Moon className="h-4 w-4" />;
      case 'readiness':
        return <Activity className="h-4 w-4" />;
      case 'load':
        return <BarChart className="h-4 w-4" />;
      case 'strain':
        return <HeartHandshake className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-indigo-300 bg-indigo-500/10 border-indigo-400/20';
      case 'amber':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-400/20';
      case 'red':
        return 'text-rose-300 bg-rose-500/10 border-rose-400/20';
      default:
        return 'text-indigo-300 bg-indigo-500/10 border-indigo-400/20';
    }
  };

  return (
    <div 
      className="spotlight-card flex items-start gap-3 mt-4 animate-spotlight-in"
      role="alert"
      aria-live="polite"
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${getSeverityClasses(insight.severity)}`}>
        {getMetricIcon(insight.metric)}
      </div>

      <div className="flex-1">
        <p className="text-sm leading-relaxed text-white/90">
          {insight.message}
        </p>
      </div>

      <button
        aria-label="Dismiss insight"
        className="text-white/40 hover:text-white/70 transition-colors p-1 rounded-md hover:bg-white/5"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
