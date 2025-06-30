
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RiskFlagCell } from './RiskFlagCell';
import { getReadinessBadgeColor } from '../utils/riskBoardStyles';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

interface RiskBoardAccordionRowProps {
  athlete: RiskBoardData;
  onAthleteClick: (athleteId: string) => void;
}

export const RiskBoardAccordionRow: React.FC<RiskBoardAccordionRowProps> = ({
  athlete,
  onAthleteClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAthleteClick(athlete.athlete_id);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-white dark:bg-gray-800 mx-4 my-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            onClick={handleRowClick}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[56px]"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <RiskFlagCell flag={athlete.flag} isMobile={true} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {athlete.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Readiness: {athlete.readiness}%
                </p>
              </div>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Readiness
                  </p>
                  <Badge className={getReadinessBadgeColor(athlete.readiness)}>
                    {athlete.readiness}%
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    ACWR
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {athlete.acwr?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Yesterday HSR
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {athlete.yesterday_hsr?.toFixed(0) || 'N/A'}
                </p>
              </div>

              <button
                onClick={handleViewDetails}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
