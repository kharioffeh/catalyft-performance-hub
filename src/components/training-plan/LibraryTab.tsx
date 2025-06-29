
import React from 'react';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';

export const LibraryTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Exercise Library</h2>
        <p className="text-white/70">Browse and search through available exercises</p>
      </div>
      
      <ExerciseLibrary />
    </div>
  );
};
