
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBoardTable } from '@/components/RiskBoardTable';
import { RiskBoardAccordion } from '@/components/RiskBoard/components/RiskBoardAccordion';
import { RiskBoardTableStates } from '@/components/RiskBoard/components/RiskBoardTableStates';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  coach_uuid: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

interface RiskBoardContentProps {
  data: RiskBoardData[];
  isLoading: boolean;
  onAthleteClick: (athleteId: string) => void;
  isMobile: boolean;
}

export const RiskBoardContent: React.FC<RiskBoardContentProps> = ({
  data,
  isLoading,
  onAthleteClick,
  isMobile,
}) => {
  // Handle loading and empty states
  if (isLoading || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Athlete Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskBoardTableStates 
            isLoading={isLoading} 
            hasData={data.length > 0} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Athlete Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Accordion View */}
        <div className="md:hidden">
          <RiskBoardAccordion
            data={data}
            onAthleteClick={onAthleteClick}
          />
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <RiskBoardTable
            data={data}
            isLoading={isLoading}
            onAthleteClick={onAthleteClick}
            isMobile={isMobile}
          />
        </div>
      </CardContent>
    </Card>
  );
};
