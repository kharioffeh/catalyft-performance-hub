
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingInviteButtonProps {
  onClick: () => void;
}

export const FloatingInviteButton: React.FC<FloatingInviteButtonProps> = ({
  onClick
}) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 border-0 z-50"
      size="icon"
    >
      <Plus className="w-6 h-6 text-white" />
    </Button>
  );
};
