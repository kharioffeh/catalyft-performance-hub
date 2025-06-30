
import React from 'react';
import { KpiTile } from './KpiTile';
import { LucideIcon } from 'lucide-react';

interface KpiData {
  id: string;
  title: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

interface MobileKpiGridProps {
  data: KpiData[];
  className?: string;
}

export const MobileKpiGrid: React.FC<MobileKpiGridProps> = ({
  data,
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Vertical scroll container */}
      <div className="overflow-y-auto scrollbar-hide">
        {/* Two-column grid with consistent spacing */}
        <div className="grid grid-cols-2 gap-4 px-4 pt-4 pb-6">
          {data.map((item) => (
            <KpiTile
              key={item.id}
              title={item.title}
              value={item.value}
              icon={item.icon}
              trend={item.trend}
              color={item.color}
              onClick={item.onClick}
              isLoading={item.isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
