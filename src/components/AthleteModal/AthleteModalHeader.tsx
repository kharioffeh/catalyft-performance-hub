
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AthleteModalHeaderProps {
  athleteName?: string;
}

export const AthleteModalHeader: React.FC<AthleteModalHeaderProps> = ({
  athleteName,
}) => {
  return (
    <DialogHeader className="p-6 pb-0">
      <DialogTitle className="text-2xl">
        {athleteName || 'Loading...'} - Risk Analysis
      </DialogTitle>
    </DialogHeader>
  );
};
