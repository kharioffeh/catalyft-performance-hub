
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
}

export const WeekTable: React.FC<WeekTableProps> = ({ week }) => {
  if (!week || week.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sessions for this week
      </div>
    );
  }

  // Group exercises by session
  const sessionGroups = week.reduce((acc: Record<string, Exercise[]>, session) => {
    if (!acc[session.sessionName]) {
      acc[session.sessionName] = [];
    }
    acc[session.sessionName] = acc[session.sessionName].concat(session.exercises || []);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sessionGroups).map(([sessionName, exercises]) => (
        <div key={sessionName} className="space-y-2">
          <h4 className="text-md font-semibold text-gray-800 border-b pb-2">
            {sessionName}
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
                {exercises.map((exercise: Exercise, idx: number) => (
                  <tr key={idx} className="even:bg-gray-50">
                    <td className="px-3 py-1 font-medium">{exercise.name}</td>
                    <td className="px-3 py-1">{exercise.pct1RM || '-'}%</td>
                    <td className="px-3 py-1">{exercise.sets || '-'}</td>
                    <td className="px-3 py-1">{exercise.reps || '-'}</td>
                    <td className="px-3 py-1">{exercise.rest || '-'}</td>
                    <td className="px-3 py-1">{exercise.rpe || '-'}</td>
                    <td className="px-3 py-1 text-sm text-gray-600">
                      {exercise.notes || '-'}
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
