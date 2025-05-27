
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { getFlagIcon, getFlagBadgeColor } from '../utils/riskBoardStyles';

interface RiskFlagCellProps {
  flag: string;
  isMobile: boolean;
}

export const RiskFlagCell: React.FC<RiskFlagCellProps> = ({ flag, isMobile }) => {
  const getIconComponent = (flag: string) => {
    switch (flag) {
      case 'red':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'amber':
        return <TrendingDown className="w-4 h-4 text-amber-600" />;
      case 'green':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {isMobile ? (
        <div className="flex flex-col items-center space-y-1">
          {getIconComponent(flag)}
          <Badge className={getFlagBadgeColor(flag)} variant="outline">
            {flag.charAt(0).toUpperCase() + flag.slice(1)}
          </Badge>
        </div>
      ) : (
        <Badge className={getFlagBadgeColor(flag)}>
          {getIconComponent(flag)}
          <span className="ml-1">{flag.charAt(0).toUpperCase() + flag.slice(1)}</span>
        </Badge>
      )}
    </div>
  );
};
