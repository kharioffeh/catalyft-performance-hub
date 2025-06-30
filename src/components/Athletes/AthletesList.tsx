
import React, { useState, useMemo } from 'react';
import { Athlete } from '@/types/athlete';
import { AthleteSearchBar } from './AthleteSearchBar';
import { AthleteListItem } from './AthleteListItem';
import { User } from 'lucide-react';

interface AthletesListProps {
  athletes: Athlete[];
  isLoading: boolean;
  onEdit: (athlete: Athlete) => void;
  onDelete: (id: string) => void;
}

export const AthletesList: React.FC<AthletesListProps> = ({
  athletes,
  isLoading,
  onEdit,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAthletes = useMemo(() => {
    if (!searchQuery.trim()) return athletes;
    
    const query = searchQuery.toLowerCase();
    return athletes.filter(athlete =>
      athlete.name.toLowerCase().includes(query)
    );
  }, [athletes, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="mx-4 my-2 h-12 bg-glass-card-light/30 dark:bg-glass-card-dark/50 rounded-xl animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="mx-4 h-20 bg-glass-card-light/30 dark:bg-glass-card-dark/50 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      {/* Search Bar */}
      <AthleteSearchBar onSearch={setSearchQuery} />

      {/* Athletes List */}
      <div className="space-y-2">
        {filteredAthletes.length > 0 ? (
          filteredAthletes.map((athlete) => (
            <AthleteListItem
              key={athlete.id}
              athlete={athlete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>
              {searchQuery.trim() 
                ? `No athletes found matching "${searchQuery}"`
                : "No athletes added yet. Click the + button to invite your first athlete."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
