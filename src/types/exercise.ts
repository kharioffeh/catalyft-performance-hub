
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

export interface ExerciseFilters {
  pattern?: string[];
  muscle?: string[];
  equipment?: string[];
  modality?: string[];
  sport?: string[];
  intensity_zone?: string;
  difficulty?: string;
}
