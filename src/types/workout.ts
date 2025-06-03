
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  pattern: string[];
  muscle: string[];
  equipment: string[];
  modality: string[];
  sport: string[];
  intensity_zone?: string;
  plane?: string;
  energy_system?: string;
  difficulty?: string;
  origin: string;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  coach_uuid: string;
  name: string;
  description?: string;
  category?: string;
  estimated_duration?: number;
  difficulty_level?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  // Add optional properties for program templates
  block_json?: any;
  origin?: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  sets?: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  weight_kg?: number;
  distance_meters?: number;
  notes?: string;
  created_at: string;
  exercise?: Exercise;
}

export interface AssignedWorkout {
  id: string;
  template_id: string;
  athlete_uuid: string;
  coach_uuid: string;
  assigned_date: string;
  due_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped';
  notes?: string;
  created_at: string;
  updated_at: string;
  template?: WorkoutTemplate;
  athlete?: {
    name: string;
  };
}

export interface WorkoutPerformance {
  id: string;
  assigned_workout_id: string;
  exercise_id: string;
  set_number: number;
  reps_completed?: number;
  weight_used_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  perceived_exertion?: number;
  notes?: string;
  completed_at: string;
  exercise?: Exercise;
}
