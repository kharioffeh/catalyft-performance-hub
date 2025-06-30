
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SegmentedControlProps {
  segments: string[];
  activeSegment: string;
  onSegmentChange: (segment: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  activeSegment,
  onSegmentChange,
  className
}) => {
  return (
    <Tabs value={activeSegment} onValueChange={onSegmentChange} className={cn("w-full", className)}>
      <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
        {segments.map((segment) => (
          <TabsTrigger
            key={segment}
            value={segment.toLowerCase()}
            className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all duration-200 font-medium"
          >
            {segment}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
