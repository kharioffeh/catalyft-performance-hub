
import { useState } from 'react';

export const useAthleteModal = () => {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAthleteClick = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAthleteId(null);
  };

  return {
    selectedAthleteId,
    isModalOpen,
    handleAthleteClick,
    handleModalClose
  };
};
