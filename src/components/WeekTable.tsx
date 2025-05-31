
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
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead>%1RM</TableHead>
                <TableHead>Sets</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead>Rest</TableHead>
                <TableHead>RPE</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise: Exercise, idx: number) => (
                <TableRow key={idx} className="even:bg-row-alt">
                  <TableCell className="font-medium">{exercise.name}</TableCell>
                  <TableCell>{exercise.pct1RM || '-'}%</TableCell>
                  <TableCell>{exercise.sets || '-'}</TableCell>
                  <TableCell>{exercise.reps || '-'}</TableCell>
                  <TableCell>{exercise.rest || '-'}</TableCell>
                  <TableCell>{exercise.rpe || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {exercise.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};
