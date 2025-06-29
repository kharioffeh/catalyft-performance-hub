
import { useState } from 'react';
import { Template } from '@/types/training';

export interface BuilderMeta {
  name: string;
  goal: 'strength' | 'power' | 'hypertrophy' | 'endurance' | 'rehab';
  audience: 'team' | 'individual';
  weeks: number;
  description?: string;
}

export interface BuilderExercise {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  load_percent?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface BuilderSession {
  id: string;
  title: string;
  day: number; // 0-6 (Mon-Sun)
  week: number; // 1-N
  exercises: BuilderExercise[];
}

export interface BuilderState {
  meta: BuilderMeta;
  sessions: BuilderSession[];
}

export function useTemplateBuilder(initialTemplate?: Template & { sessions?: BuilderSession[] }) {
  const [meta, setMeta] = useState<BuilderMeta>(() => ({
    name: initialTemplate?.title || '',
    goal: initialTemplate?.goal || 'strength',
    audience: 'individual',
    weeks: initialTemplate?.weeks || 4,
    description: ''
  }));

  const [sessions, setSessions] = useState<BuilderSession[]>(
    initialTemplate?.sessions || []
  );

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
    const newSession: BuilderSession = {
      id: `session-${week}-${day}-${Date.now()}`,
      title: `Week ${week}, Day ${day + 1}`,
      day,
      week,
      exercises: []
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateSession = (sessionId: string, updates: Partial<BuilderSession>) => {
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
