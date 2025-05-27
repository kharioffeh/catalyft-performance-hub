
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskBoardTable } from '@/components/RiskBoardTable';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Athlete Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <RiskBoardTable
          data={data}
          isLoading={isLoading}
          onAthleteClick={onAthleteClick}
          isMobile={isMobile}
        />
      </CardContent>
    </Card>
  );
};
