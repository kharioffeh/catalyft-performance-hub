
import React from 'react';
import { Reorder } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { openLibrary } from './LibraryDrawer';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

interface Session {
  id: string;
  sessionName: string;
  exercises: Exercise[];
}

interface SessionCardProps {
  value: Session;
  onChange: (session: Session) => void;
}

export default function SessionCard({ value: session, onChange }: SessionCardProps) {
  const addExercise = () => {
    openLibrary((exercise) => {
      onChange({
        ...session,
        exercises: [...session.exercises, { ...exercise, sets: 3, reps: 10 }]
      });
    });
  };

  return (
    <Reorder.Item 
      value={session}
      className="bg-white border rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing"
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <Input
          value={session.sessionName}
          onChange={(e) => onChange({ ...session, sessionName: e.target.value })}
          className="font-medium"
          placeholder="Session name"
        />
      </div>
      
      {session.exercises.length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full table-auto text-sm">
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
      
      <Button onClick={addExercise} variant="ghost" size="sm" className="w-full">
        + Add Exercise
      </Button>
    </Reorder.Item>
  );
}
