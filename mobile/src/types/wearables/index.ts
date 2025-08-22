// Wearable Device Types and Interfaces

export type WearableType = 
  | 'apple_watch' 
  | 'whoop' 
  | 'garmin' 
  | 'fitbit' 
  | 'google_fit'
  | 'oura'
  | 'polar'
  | 'suunto';

export interface WearableDevice {
  id: string;
  type: WearableType;
  name: string;
  connected: boolean;
  lastSync: Date;
  battery?: number;
  firmware?: string;
  capabilities: DeviceCapabilities;
  syncSettings: SyncSettings;
  status: DeviceStatus;
}

export interface DeviceCapabilities {
  // Activity Metrics
  heartRate: boolean;
  steps: boolean;
  calories: boolean;
  distance: boolean;
  floors: boolean;
  activeMinutes: boolean;
  
  // Advanced Metrics
  hrv: boolean;
  vo2Max: boolean;
  bloodOxygen: boolean;
  temperature: boolean;
  respiratoryRate: boolean;
  stress: boolean;
  
  // Training Metrics
  workouts: boolean;
  trainingLoad: boolean;
  recovery: boolean;
  strain: boolean;
  performanceCondition: boolean;
  
  // Sleep & Recovery
  sleep: boolean;
  sleepStages: boolean;
  readiness: boolean;
  bodyBattery: boolean;
  
  // Real-time
  liveHeartRate: boolean;
  liveWorkoutTracking: boolean;
  
  // Export
  workoutExport: boolean;
  nutritionExport: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  syncFrequency: 'realtime' | '5min' | '15min' | '30min' | '1hour' | 'manual';
  wifiOnly: boolean;
  backgroundSync: boolean;
  dataTypes: DataTypeSettings;
  conflictResolution: 'device' | 'manual' | 'catalyft';
}

export interface DataTypeSettings {
  workouts: boolean;
  heartRate: boolean;
  sleep: boolean;
  steps: boolean;
  calories: boolean;
  weight: boolean;
  nutrition: boolean;
  recovery: boolean;
}

export interface DeviceStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastError?: string;
  lastSuccessfulSync?: Date;
  pendingSyncItems: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Unified Metrics
export interface UnifiedMetrics {
  timestamp: Date;
  source: WearableType[];
  
  // Current Vitals
  heartRate?: HeartRateData;
  heartRateVariability?: HRVData;
  bloodOxygen?: number;
  respiratoryRate?: number;
  temperature?: number;
  
  // Activity
  steps: number;
  distance: number;
  calories: CaloriesData;
  activeMinutes: number;
  floors?: number;
  
  // Recovery & Readiness
  recoveryScore?: number;
  readinessScore?: number;
  strainScore?: number;
  stressLevel?: number;
  bodyBattery?: number;
  
  // Sleep
  sleep?: SleepData;
  
  // Training
  trainingLoad?: TrainingLoadData;
  vo2Max?: number;
  performanceCondition?: number;
  
  // Recommendations
  recommendations?: TrainingRecommendation[];
}

export interface HeartRateData {
  current?: number;
  resting: number;
  average: number;
  max: number;
  min: number;
  zones: HeartRateZones;
  variability?: number;
}

export interface HeartRateZones {
  zone1: number; // Recovery
  zone2: number; // Easy
  zone3: number; // Moderate
  zone4: number; // Hard
  zone5: number; // Maximum
}

export interface HRVData {
  value: number;
  trend: 'improving' | 'stable' | 'declining';
  baseline: number;
  percentile: number;
}

export interface CaloriesData {
  total: number;
  active: number;
  resting: number;
  bmr: number;
}

export interface SleepData {
  duration: number;
  efficiency: number;
  score?: number;
  stages?: SleepStages;
  latency?: number;
  disturbances?: number;
  timeInBed: number;
  restfulness?: number;
}

export interface SleepStages {
  awake: number;
  rem: number;
  light: number;
  deep: number;
}

export interface TrainingLoadData {
  acute: number;  // 7-day
  chronic: number; // 28-day
  ratio: number;   // Acute:Chronic
  status: 'productive' | 'maintaining' | 'recovery' | 'overreaching' | 'detraining';
  recommendation: string;
}

export interface TrainingRecommendation {
  type: 'intensity' | 'duration' | 'recovery' | 'nutrition' | 'sleep';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  reasoning?: string;
}

// Sync Results
export interface SyncResult {
  deviceId: string;
  success: boolean;
  timestamp: Date;
  itemsSynced: number;
  errors?: string[];
  conflicts?: DataConflict[];
  metrics?: Partial<UnifiedMetrics>;
}

export interface DataConflict {
  field: string;
  deviceValue: any;
  catalyftValue: any;
  resolution?: 'device' | 'catalyft' | 'merged';
}

// Workout Export
export interface WorkoutExport {
  id: string;
  name: string;
  type: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  calories: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  distance?: number;
  exercises?: ExerciseData[];
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ExerciseData {
  name: string;
  sets: SetData[];
  muscleGroups?: string[];
  equipment?: string;
}

export interface SetData {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  rpe?: number;
}

// Recovery Metrics
export interface RecoveryMetrics {
  score: number; // 0-100
  hrv: HRVData;
  restingHeartRate: number;
  sleepQuality: number;
  muscleSoreness?: number;
  fatigue?: number;
  stress?: number;
  hydration?: number;
  recommendation: string;
  factors: RecoveryFactor[];
}

export interface RecoveryFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  value: number;
  description: string;
}

// Webhook Events
export interface WearableWebhookEvent {
  type: 'data_update' | 'device_connected' | 'device_disconnected' | 'sync_complete' | 'error';
  deviceId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}

// Permission States
export interface WearablePermissions {
  healthKit?: HealthKitPermissions;
  googleFit?: GoogleFitPermissions;
  location?: boolean;
  bluetooth?: boolean;
  notifications?: boolean;
}

export interface HealthKitPermissions {
  read: string[];
  write: string[];
  granted: boolean;
}

export interface GoogleFitPermissions {
  scopes: string[];
  granted: boolean;
}