export interface ProgramPatch {
  id: string;
  name: string;
  mesocycles: Mesocycle[];
  start_date: string;
  end_date: string;
  total_weeks: number;
  user_uuid?: string;
}

export interface Mesocycle {
  id: string;
  label: string;
  weeks: number;
  start_week: number;
  focus: string;
  sessions: DailySession[];
}

export interface DailySession {
  id: string;
  day: number; // 1-7 (Monday-Sunday)
  week: number;
  title: string;
  type: 'strength' | 'conditioning' | 'recovery' | 'technical' | 'assessment';
  duration_minutes?: number;
  exercises: ProgramExercise[];
  notes?: string;
}

export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // Could be "8-12" or "10" etc
  load_percent?: number;
  rest_seconds?: number;
  primary_muscle: string;
  notes?: string;
}

export interface ProgramCalendarDay {
  date: string;
  weekday: string;
  dateLabel: string;
  sessions: DailySession[];
  mesocycleLabel?: string;
  weekNumber: number;
}

export interface ProgramCalendarWeek {
  weekNumber: number;
  start: string;
  end: string;
  mesocycleLabel: string;
  days: ProgramCalendarDay[];
}