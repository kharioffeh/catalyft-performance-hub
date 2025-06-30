
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Athlete } from '@/types/athlete';
import { GlassContainer } from '@/components/Glass/GlassContainer';

interface AthleteListItemProps {
  athlete: Athlete;
  onEdit: (athlete: Athlete) => void;
  onDelete: (id: string) => void;
}

export const AthleteListItem: React.FC<AthleteListItemProps> = ({
  athlete,
  onEdit,
  onDelete
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusInfo = () => {
    const createdDate = new Date(athlete.created_at);
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated <= 7) {
      return { status: 'New', variant: 'default' as const };
    }
    
    // For now, mark all as active since we don't have session data here
    return { status: 'Active', variant: 'secondary' as const };
  };

  const age = calculateAge(athlete.dob);
  const { status, variant } = getStatusInfo();

  return (
    <GlassContainer className="mx-4 my-1">
      <div className="flex items-center p-4 min-h-[60px]">
        {/* Avatar */}
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
            {getInitials(athlete.name)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 ml-4">
          <h3 className="font-medium text-gray-800 dark:text-white">
            {athlete.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {age && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {age} years
              </span>
            )}
            {athlete.sex && (
              <>
                {age && <span className="text-gray-300">•</span>}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {athlete.sex}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={variant} className="mr-3">
          {status}
        </Badge>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(athlete)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(athlete.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </GlassContainer>
  );
};
