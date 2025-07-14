export interface ExerciseLibrary {
  id: string;
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscle: string[];
  video_url?: string;
  coach_uuid?: string;
  created_at: string;
}

export interface Template {
  id: string;
  owner_uuid: string;
  title: string;
  goal: 'strength' | 'power' | 'hypertrophy' | 'endurance' | 'rehab';
  weeks: number;
  visibility: 'private' | 'org' | 'public';
  created_at: string;
}

export interface TemplateBlock {
  template_id: string;
  week_no: number;
  day_no: number;
  session_title?: string;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  exercise_id: string;
  sets: number;
  reps: number;
  load_percent?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ProgramInstance {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  source: 'template' | 'aria';
  template_id?: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'archived';
  created_at: string;
  template?: Template;
}

export interface Session {
  id: string;
  program_id: string;
  planned_at: string;
  completed_at?: string;
  title?: string;
  status?: 'scheduled' | 'in-progress' | 'completed';
  notes?: string;
  rpe?: number;
  strain?: number;
  acwr_snapshot?: number;
  exercises: SessionExercise[];
  created_at: string;
  program?: ProgramInstance;
}

export interface SessionExercise {
  exercise_id: string;
  sets: number;
  reps: number;
  load_kg?: number;
  completed?: boolean;
  notes?: string;
}

export interface SetLog {
  id: string;
  session_id: string;
  exercise_id: string;
  set_no: number;
  reps?: number;
  load?: number;
  rpe?: number;
  created_at: string;
  exercise?: ExerciseLibrary;
}

export interface CreateTemplateData {
  title: string;
  goal: Template['goal'];
  weeks: number;
  visibility?: Template['visibility'];
}

export interface CreateProgramInstanceData {
  athlete_uuid: string;
  source: ProgramInstance['source'];
  template_id?: string;
  start_date: string;
  end_date: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  type: 'strength' | 'conditioning' | 'recovery' | 'technical' | 'assessment';
  start_time: string;
  end_time: string;
  athlete_id: string;
  notes?: string;
}

export interface Day {
  date: string;
  weekday: string;
  dateLabel: string;
  fullDate: string;
  sessions: TrainingSession[];
}

export interface Week {
  start: string;
  end: string;
  days: Day[];
}
