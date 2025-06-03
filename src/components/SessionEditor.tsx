
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { openLibrary } from './LibraryDrawer';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

interface Session {
  sessionName: string;
  exercises: Exercise[];
}

interface SessionEditorProps {
  session: Session;
  onChange: (session: Session) => void;
}

export default function SessionEditor({ session, onChange }: SessionEditorProps) {
  const addExercise = () => {
    openLibrary((exercise) => {
      onChange({
        ...session,
        exercises: [...session.exercises, { ...exercise, sets: 3, reps: 10 }]
      });
    });
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4 mb-4">
      <Input
        value={session.sessionName}
        onChange={(e) => onChange({ ...session, sessionName: e.target.value })}
        className="mb-3 font-medium"
        placeholder="Session name"
      />
      
      {session.exercises.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto mb-3 text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Exercise</th>
                <th className="text-center py-2 w-20">Sets</th>
                <th className="text-center py-2 w-20">Reps</th>
              </tr>
            </thead>
            <tbody>
              {session.exercises.map((exercise, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">{exercise.name}</td>
                  <td className="py-2">
                    <Input
                      className="w-16 text-center mx-auto"
                      value={exercise.sets}
                      onChange={(e) => {
                        const clone = [...session.exercises];
                        clone[i].sets = parseInt(e.target.value) || 0;
                        onChange({ ...session, exercises: clone });
                      }}
                    />
                  </td>
                  <td className="py-2">
                    <Input
                      className="w-16 text-center mx-auto"
                      value={exercise.reps}
                      onChange={(e) => {
                        const clone = [...session.exercises];
                        clone[i].reps = parseInt(e.target.value) || 0;
                        onChange({ ...session, exercises: clone });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Button onClick={addExercise} variant="ghost" size="sm">
        + Add Exercise
      </Button>
    </div>
  );
}
