
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SessionEditor from './SessionEditor';

interface Session {
  sessionName: string;
  exercises: any[];
}

interface Week {
  sessions: Session[];
}

interface WeekEditorProps {
  week: Week;
  weekIdx: number;
  onChange: (week: Week) => void;
}

export default function WeekEditor({ week, weekIdx, onChange }: WeekEditorProps) {
  const addSession = () => {
    onChange({
      ...week,
      sessions: [...week.sessions, { sessionName: 'New Session', exercises: [] }]
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Week {weekIdx + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        {week.sessions.map((session, idx) => (
          <SessionEditor 
            key={idx} 
            session={session} 
            onChange={(newSession) => {
              const clone = { ...week };
              clone.sessions[idx] = newSession;
              onChange(clone);
            }}
          />
        ))}
        <Button 
          onClick={addSession} 
          variant="ghost" 
          className="mt-2"
        >
          + Add Session
        </Button>
      </CardContent>
    </Card>
  );
}
