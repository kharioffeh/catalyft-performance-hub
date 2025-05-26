
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const ReadinessBadge: React.FC = () => {
  const { profile } = useAuth();

  const { data: readinessScore } = useQuery({
    queryKey: ['readiness', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score')
        .eq('athlete_uuid', profile.id)
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && profile?.role === 'athlete'
  });

  if (!readinessScore || profile?.role !== 'athlete') {
    return null;
  }

  const score = Math.round(readinessScore.score);
  
  // Gradient colors based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className={`
      px-3 py-1 rounded-full text-white text-sm font-medium
      bg-gradient-to-r ${getScoreColor(score)}
    `}>
      Readiness: {score}%
    </div>
  );
};
