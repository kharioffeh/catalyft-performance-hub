
import React from 'react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { RiskBoardHeader } from '@/components/RiskBoardHeader';
import { RiskBoardContent } from '@/components/RiskBoardContent';
import { useRiskBoardData } from '@/hooks/useRiskBoardData';
import { useAthleteModal } from '@/hooks/useAthleteModal';
import { useRequireRole } from '@/hooks/useRequireRole';
import { AthleteModal } from '@/components/AthleteModal';

const CoachRiskBoard: React.FC = () => {
  // Use the role guard hook - redirects if not coach
  const hasAccess = useRequireRole('coach');
  
  const isMobile = useIsMobile();
  const { riskBoardData, isLoading } = useRiskBoardData();
  const { 
    selectedAthleteId, 
    isModalOpen, 
    handleAthleteClick, 
    handleModalClose 
  } = useAthleteModal();

  // Don't render anything if user doesn't have access (will be redirected)
  if (!hasAccess) {
    return null;
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
