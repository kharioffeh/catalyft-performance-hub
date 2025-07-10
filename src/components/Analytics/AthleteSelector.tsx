
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAthletes } from '@/hooks/useAthletes';
import { useAuth } from '@/contexts/AuthContext';

interface AthleteSelectorProps {
  selectedAthleteId: string;
  onAthleteChange: (athleteId: string) => void;
}

export const AthleteSelector: React.FC<AthleteSelectorProps> = ({
  selectedAthleteId,
  onAthleteChange
}) => {
  const { profile } = useAuth();
  const { athletes, isLoading } = useAthletes();

  // Don't show selector for non-coaches
  if (profile?.role !== 'coach') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-64">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-64">
      <Select value={selectedAthleteId} onValueChange={onAthleteChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an athlete" />
        </SelectTrigger>
        <SelectContent>
          {athletes.map((athlete) => (
            <SelectItem key={athlete.id} value={athlete.id}>
              {athlete.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
