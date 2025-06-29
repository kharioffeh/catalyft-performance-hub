
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  isLoading = false,
  className
}) => {
  return (
    <div
      className={cn(
        'h-32 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4',
        'flex flex-col justify-between',
        'hover:bg-white/10 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
        {Icon && (
          <div className="p-2 bg-white/10 rounded-lg">
            <Icon className="w-4 h-4 text-white/60" />
          </div>
        )}
      </div>
      
      <div className="flex items-end">
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <span className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
