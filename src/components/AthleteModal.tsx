
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAthleteData } from '@/hooks/useAthleteData';
import { AthleteModalHeader } from './AthleteModal/AthleteModalHeader';
import { AthleteModalContent } from './AthleteModal/AthleteModalContent';
import { AthleteModalAnimation } from './AthleteModal/AthleteModalAnimation';

interface AthleteModalProps {
  athleteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  athleteId,
  open,
  onOpenChange,
  isMobile,
}) => {
  const [activeTab, setActiveTab] = useState('trends');
  const { data: athlete } = useAthleteData(athleteId, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isMobile 
            ? 'w-full h-full max-w-full max-h-full rounded-none' 
            : 'w-[90vw] max-w-4xl h-[90vh]'
        } overflow-hidden p-0`}
      >
        <AthleteModalAnimation isOpen={open} isMobile={isMobile}>
          <AthleteModalHeader athleteName={athlete?.name} />
          
          {athleteId && (
            <AthleteModalContent
              athleteId={athleteId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </AthleteModalAnimation>
      </DialogContent>
    </Dialog>
  );
};
