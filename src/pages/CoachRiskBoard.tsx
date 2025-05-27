
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RiskBoardTable } from '@/components/RiskBoardTable';
import { AthleteModal } from '@/components/AthleteModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  coach_uuid: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

const CoachRiskBoard: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: riskBoardData, isLoading, refetch } = useQuery({
    queryKey: ['riskBoard', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('vw_risk_board')
        .select('*')
        .eq('coach_uuid', profile.id)
        .order('flag', { ascending: false })
        .order('readiness', { ascending: true });

      if (error) throw error;
      return data as RiskBoardData[];
    },
    enabled: !!profile?.id && profile?.role === 'coach'
  });

  // Set up realtime listener
  React.useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase.channel(`risk_board_${profile.id}`);
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'readiness_scores' },
      () => {
        console.log('Risk board data updated - refetching');
        refetch();
      }
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wearable_raw' },
      () => {
        console.log('Wearable data updated - refetching');
        refetch();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refetch]);

  const handleAthleteClick = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAthleteId(null);
  };

  if (profile?.role !== 'coach') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. This page is only available for coaches.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Board</h1>
          <p className="text-gray-600 mt-2">
            Monitor athlete injury risk and recovery status
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-red-50 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Risk
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-800">
            <TrendingDown className="w-3 h-3 mr-1" />
            Medium Risk
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            Low Risk
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Athlete Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskBoardTable
            data={riskBoardData || []}
            isLoading={isLoading}
            onAthleteClick={handleAthleteClick}
            isMobile={isMobile}
          />
        </CardContent>
      </Card>

      <AthleteModal
        athleteId={selectedAthleteId}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        isMobile={isMobile}
      />
    </div>
  );
};

export default CoachRiskBoard;
