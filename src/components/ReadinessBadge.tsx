
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const ReadinessBadge: React.FC = () => {
  const { profile } = useAuth();

  const { data: readinessData } = useQuery({
    queryKey: ['readiness-badge', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score')
        .eq('athlete_uuid', profile.id)
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  if (!readinessData) return null;

  const score = Math.round(readinessData.score);
  const getVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Badge variant={getVariant(score)}>
      Readiness: {score}%
    </Badge>
  );
};
