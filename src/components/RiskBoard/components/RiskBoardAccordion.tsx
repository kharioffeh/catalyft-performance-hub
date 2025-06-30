
import React from 'react';
import { RiskBoardAccordionRow } from './RiskBoardAccordionRow';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

interface RiskBoardAccordionProps {
  data: RiskBoardData[];
  onAthleteClick: (athleteId: string) => void;
}

export const RiskBoardAccordion: React.FC<RiskBoardAccordionProps> = ({
  data,
  onAthleteClick
}) => {
  return (
    <div className="pb-8">
      <div className="space-y-1">
        {data.map((athlete) => (
          <RiskBoardAccordionRow
            key={athlete.athlete_id}
            athlete={athlete}
            onAthleteClick={onAthleteClick}
          />
        ))}
      </div>
    </div>
  );
};
