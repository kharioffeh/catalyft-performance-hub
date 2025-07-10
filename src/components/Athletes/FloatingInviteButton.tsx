
import React from 'react';
import { Fab } from '@/components/ui/Fab';

interface FloatingInviteButtonProps {
  onClick: () => void;
}

export const FloatingInviteButton: React.FC<FloatingInviteButtonProps> = ({
  onClick
}) => {
  return (
    <Fab 
      onPress={onClick}
      aria-label="Invite new athlete"
    />
  );
};
