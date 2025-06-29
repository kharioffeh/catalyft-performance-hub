
import { useState } from 'react';

export interface ProgramMeta {
  name: string;
  goal: 'strength' | 'power' | 'hypertrophy' | 'endurance' | 'rehab';
  audience: 'team' | 'individual';
  weeks: number;
  description?: string;
}

export interface ProgramExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  load_percent?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ProgramSession {
  id: string;
  title: string;
  day: number; // 0-6 (Mon-Sun)
  week: number; // 1-N
  exercises: ProgramExercise[];
}

export function useEnhancedProgramBuilder() {
  const [meta, setMeta] = useState<ProgramMeta>({
    name: '',
    goal: 'strength',
    audience: 'individual',
    weeks: 4,
    description: ''
  });

  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const reset = () => {
    setMeta({
      name: '',
      goal: 'strength',
      audience: 'individual',
      weeks: 4,
      description: ''
    });
    setSessions([]);
    setCurrentStep(0);
  };

  const addSession = (week: number, day: number) => {
    const newSession: ProgramSession = {
      id: `session-${week}-${day}-${Date.now()}`,
      title: `Week ${week}, Day ${day + 1}`,
      day,
      week,
      exercises: []
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateSession = (sessionId: string, updates: Partial<ProgramSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const getSessionsForWeekDay = (week: number, day: number) => {
    return sessions.filter(session => session.week === week && session.day === day);
  };

  const isValid = () => {
    return meta.name.trim() !== '' && sessions.length > 0;
  };

  return {
    meta,
    setMeta,
    sessions,
    setSessions,
    currentStep,
    setCurrentStep,
    addSession,
    updateSession,
    removeSession,
    getSessionsForWeekDay,
    isValid,
    reset
  };
}
