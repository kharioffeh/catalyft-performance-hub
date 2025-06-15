
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ARIAInsightProps {
  metric: string;
  period: number;
}

export const ARIAInsight: React.FC<ARIAInsightProps> = ({ metric, period }) => {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!profile?.id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("aria_insights_v")
          .select("json")
          .eq("athlete_uuid", profile.id)
          .eq("json->>metric", metric)
          .gte("created_at", new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching insights:', error);
          return;
        }

        setInsights(data?.map((r: any) => r.json?.message ?? '') || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [metric, period, profile?.id]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (insights.length === 0) {
    return <p className="text-sm text-gray-500">No insights available for this period.</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1">
      {insights.map((text, i) => (
        <li key={i} className="text-sm text-gray-700">{text}</li>
      ))}
    </ul>
  );
};
