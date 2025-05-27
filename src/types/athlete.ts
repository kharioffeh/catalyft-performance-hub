
export interface Athlete {
  id: string;
  name: string;
  sex: string | null;
  dob: string | null;
  coach_uuid: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteFormData {
  name: string;
  sex: string;
  dob: string;
}
