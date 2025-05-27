
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteModal } from '@/components/AthleteModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { RiskBoardHeader } from '@/components/RiskBoardHeader';
import { RiskBoardContent } from '@/components/RiskBoardContent';
import { useRiskBoardData } from '@/hooks/useRiskBoardData';
import { useAthleteModal } from '@/hooks/useAthleteModal';

const CoachRiskBoard: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const { riskBoardData, isLoading } = useRiskBoardData();
  const { 
    selectedAthleteId, 
    isModalOpen, 
    handleAthleteClick, 
    handleModalClose 
  } = useAthleteModal();

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
      <RiskBoardHeader />
      
      <RiskBoardContent
        data={riskBoardData}
        isLoading={isLoading}
        onAthleteClick={handleAthleteClick}
        isMobile={isMobile}
      />

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
