
import React from 'react';
import { EditableCell } from '@/components/EditableCell';

interface Exercise {
  name: string;
  pct1RM?: number;
  sets?: number;
  reps?: number;
  rest?: string;
  rpe?: number;
  notes?: string;
}

interface Session {
  sessionName: string;
  exercises?: Exercise[];
}

interface WeekTableProps {
  week: Session[];
  editable?: boolean;
  onExerciseUpdate?: (sessionIndex: number, exerciseIndex: number, field: string, value: string | number) => void;
}

export const WeekTable: React.FC<WeekTableProps> = ({ 
  week, 
  editable = false, 
  onExerciseUpdate 
}) => {
  if (!week || week.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sessions for this week
      </div>
    );
  }

  const handleCellUpdate = (sessionIndex: number, exerciseIndex: number, field: string, value: string | number) => {
    if (onExerciseUpdate) {
      onExerciseUpdate(sessionIndex, exerciseIndex, field, value);
    }
  };

  return (
    <div className="space-y-6">
      {week.map((session, sessionIndex) => (
        <div key={sessionIndex} className="space-y-2">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
            {session.sessionName}
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">Exercise</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">%1RM</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">Sets</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">Reps</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">Rest</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">RPE</th>
                  <th className="bg-gray-100 text-left px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {(session.exercises || []).map((exercise: Exercise, exerciseIndex: number) => (
                  <tr key={exerciseIndex} className="even:bg-gray-50">
                    <td className="px-3 py-1 font-medium">{exercise.name}</td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={exercise.pct1RM || ''}
                        editable={editable}
                        type="number"
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'pct1RM', value)}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={exercise.sets || ''}
                        editable={editable}
                        type="number"
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'sets', value)}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={exercise.reps || ''}
                        editable={editable}
                        type="number"
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'reps', value)}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={exercise.rest || ''}
                        editable={editable}
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'rest', value)}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <EditableCell
                        value={exercise.rpe || ''}
                        editable={editable}
                        type="number"
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'rpe', value)}
                      />
                    </td>
                    <td className="px-3 py-1 text-sm text-gray-600">
                      <EditableCell
                        value={exercise.notes || ''}
                        editable={editable}
                        onSave={(value) => handleCellUpdate(sessionIndex, exerciseIndex, 'notes', value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
