import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WearableService, ConnectionOptions } from './WearableService';
import {
  WearableDevice,
  WearablePermissions,
  DeviceCapabilities,
  SyncResult,
  UnifiedMetrics,
  WorkoutExport,
  RecoveryMetrics,
  HeartRateData,
  SleepData,
  HRVData,
  RecoveryFactor,
  TrainingLoadData,
} from '../../types/wearables';

interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

interface WhoopRecovery {
  recovery_id: string;
  created_at: string;
  updated_at: string;
  score: {
    recovery_score: number;
    hrv_rmssd_milli: number;
    resting_heart_rate: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
}

interface WhoopStrain {
  strain_id: string;
  created_at: string;
  updated_at: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
  workouts?: WhoopWorkout[];
}

interface WhoopWorkout {
  workout_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  sport_id: number;
  sport_name: string;
  score: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
    distance_meter?: number;
    altitude_gain_meter?: number;
    zone_duration: {
      zone_zero_milli?: number;
      zone_one_milli?: number;
      zone_two_milli?: number;
      zone_three_milli?: number;
      zone_four_milli?: number;
      zone_five_milli?: number;
    };
  };
}

interface WhoopSleep {
  sleep_id: string;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  score: {
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
    total_sleep_time_milli: number;
    total_in_bed_time_milli: number;
    rem_sleep_time_milli: number;
    slow_wave_sleep_time_milli: number;
    light_sleep_time_milli: number;
    wake_time_milli: number;
    sleep_latency_milli: number;
    sleep_disturbances: number;
    respiratory_rate: number;
  };
}

interface WhoopPhysiologicalData {
  recovery: WhoopRecovery;
  strain: WhoopStrain;
  sleep: WhoopSleep;
}

const WHOOP_API_BASE = 'https://api.whoop.com';
const WHOOP_AUTH_URL = 'https://api.whoop.com/oauth/authorize';
const WHOOP_TOKEN_URL = 'https://api.whoop.com/oauth/token';
const STORAGE_KEY_TOKENS = '@catalyft_whoop_tokens';

export class WhoopService extends WearableService {
  private api: AxiosInstance;
  private tokens?: WhoopTokens;
  private webhookUrl?: string;
  private apiKey?: string;
  
  constructor(deviceId: string, apiKey?: string) {
    super(deviceId, 'whoop');
    this.apiKey = apiKey;
    
    this.api = axios.create({
      baseURL: WHOOP_API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        await this.ensureValidToken();
        if (this.tokens) {
          config.headers.Authorization = `Bearer ${this.tokens.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.api.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }
  
  async connect(options?: ConnectionOptions): Promise<boolean> {
    try {
      // Load stored tokens
      const storedTokens = await AsyncStorage.getItem(STORAGE_KEY_TOKENS);
      if (storedTokens) {
        this.tokens = JSON.parse(storedTokens);
      }
      
      // Verify connection
      const isValid = await this.verifyConnection();
      if (!isValid && options?.requestPermissions) {
        // Need to authenticate
        await this.authenticate();
      }
      
      this.isConnected = isValid;
      
      if (this.isConnected && options?.backgroundSync) {
        await this.setupWebhooks();
      }
      
      return this.isConnected;
    } catch (error) {
      console.error('WHOOP connection error:', error);
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.tokens = undefined;
    await AsyncStorage.removeItem(STORAGE_KEY_TOKENS);
    
    if (this.webhookUrl) {
      await this.removeWebhooks();
    }
  }
  
  async requestPermissions(): Promise<WearablePermissions> {
    // WHOOP uses OAuth, so permissions are handled during authentication
    await this.authenticate();
    
    return {
      healthKit: {
        read: ['recovery', 'strain', 'sleep', 'workouts', 'heart_rate', 'hrv'],
        write: [],
        granted: this.isConnected,
      },
    };
  }
  
  async checkPermissions(): Promise<WearablePermissions> {
    const isValid = await this.verifyConnection();
    
    return {
      healthKit: {
        read: isValid ? ['recovery', 'strain', 'sleep', 'workouts', 'heart_rate', 'hrv'] : [],
        write: [],
        granted: isValid,
      },
    };
  }
  
  getCapabilities(): DeviceCapabilities {
    return {
      // Activity Metrics
      heartRate: true,
      steps: false, // WHOOP doesn't track steps
      calories: true,
      distance: true, // For certain workouts
      floors: false,
      activeMinutes: true,
      
      // Advanced Metrics
      hrv: true,
      vo2Max: false,
      bloodOxygen: true,
      temperature: true,
      respiratoryRate: true,
      stress: true, // Via strain
      
      // Training Metrics
      workouts: true,
      trainingLoad: true,
      recovery: true,
      strain: true,
      performanceCondition: true,
      
      // Sleep & Recovery
      sleep: true,
      sleepStages: true,
      readiness: true,
      bodyBattery: false,
      
      // Real-time
      liveHeartRate: false,
      liveWorkoutTracking: false,
      
      // Export
      workoutExport: false,
      nutritionExport: false,
    };
  }
  
  async syncData(startDate: Date, endDate: Date): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;
    const metrics: Partial<UnifiedMetrics> = {
      timestamp: new Date(),
      source: ['whoop'],
    };
    
    try {
      // Get physiological data
      const physData = await this.getPhysiologicalData(startDate, endDate);
      
      // Process recovery data
      if (physData.recovery) {
        const recovery = this.processRecoveryData(physData.recovery);
        metrics.recoveryScore = recovery.score;
        metrics.heartRateVariability = recovery.hrv;
        itemsSynced++;
      }
      
      // Process strain data
      if (physData.strain) {
        const strain = this.processStrainData(physData.strain);
        metrics.strainScore = strain.score;
        metrics.calories = strain.calories;
        metrics.heartRate = strain.heartRate;
        itemsSynced++;
        
        // Process workouts
        if (physData.strain.workouts) {
          itemsSynced += physData.strain.workouts.length;
        }
      }
      
      // Process sleep data
      if (physData.sleep) {
        metrics.sleep = this.processSleepData(physData.sleep);
        itemsSynced++;
      }
      
      // Calculate training load
      metrics.trainingLoad = await this.calculateTrainingLoad();
      
      // Generate readiness score
      metrics.readinessScore = this.calculateReadinessScore(metrics);
      
      this.lastSyncTime = new Date();
      
      return {
        deviceId: this.deviceId,
        success: true,
        timestamp: new Date(),
        itemsSynced,
        errors: errors.length > 0 ? errors : undefined,
        metrics: this.validateMetrics(metrics),
      };
      
    } catch (error) {
      console.error('WHOOP sync error:', error);
      return {
        deviceId: this.deviceId,
        success: false,
        timestamp: new Date(),
        itemsSynced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  
  private async getPhysiologicalData(startDate: Date, endDate: Date): Promise<WhoopPhysiologicalData> {
    const [recovery, strain, sleep] = await Promise.all([
      this.getRecoveryData(startDate, endDate),
      this.getStrainData(startDate, endDate),
      this.getSleepData(startDate, endDate),
    ]);
    
    return {
      recovery: recovery[0], // Get most recent
      strain: strain[0],
      sleep: sleep[0],
    };
  }
  
  private async getRecoveryData(startDate: Date, endDate: Date): Promise<WhoopRecovery[]> {
    try {
      const response = await this.api.get('/v1/recovery', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      
      return response.data.records || [];
    } catch (error) {
      console.error('Failed to get WHOOP recovery data:', error);
      return [];
    }
  }
  
  private async getStrainData(startDate: Date, endDate: Date): Promise<WhoopStrain[]> {
    try {
      const response = await this.api.get('/v1/strain', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      
      return response.data.records || [];
    } catch (error) {
      console.error('Failed to get WHOOP strain data:', error);
      return [];
    }
  }
  
  private async getSleepData(startDate: Date, endDate: Date): Promise<WhoopSleep[]> {
    try {
      const response = await this.api.get('/v1/sleep', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });
      
      return response.data.records || [];
    } catch (error) {
      console.error('Failed to get WHOOP sleep data:', error);
      return [];
    }
  }
  
  private processRecoveryData(recovery: WhoopRecovery): any {
    return {
      score: recovery.score.recovery_score,
      hrv: {
        value: recovery.score.hrv_rmssd_milli,
        trend: 'stable', // Would need historical data to calculate trend
        baseline: recovery.score.hrv_rmssd_milli,
        percentile: 50,
      },
      restingHeartRate: recovery.score.resting_heart_rate,
      spo2: recovery.score.spo2_percentage,
      skinTemp: recovery.score.skin_temp_celsius,
    };
  }
  
  private processStrainData(strain: WhoopStrain): any {
    return {
      score: strain.score.strain,
      calories: {
        total: strain.score.kilojoule * 0.239, // Convert kJ to kcal
        active: strain.score.kilojoule * 0.239,
        resting: 0,
        bmr: 0,
      },
      heartRate: {
        current: undefined,
        resting: 0,
        average: strain.score.average_heart_rate,
        max: strain.score.max_heart_rate,
        min: 0,
        zones: this.calculateHeartRateZones(strain.score.max_heart_rate),
      },
    };
  }
  
  private processSleepData(sleep: WhoopSleep): SleepData {
    const durationHours = sleep.score.total_sleep_time_milli / (1000 * 60 * 60);
    const timeInBedHours = sleep.score.total_in_bed_time_milli / (1000 * 60 * 60);
    
    return {
      duration: durationHours,
      efficiency: sleep.score.sleep_efficiency_percentage,
      score: sleep.score.sleep_performance_percentage,
      stages: {
        awake: sleep.score.wake_time_milli / (1000 * 60),
        rem: sleep.score.rem_sleep_time_milli / (1000 * 60),
        light: sleep.score.light_sleep_time_milli / (1000 * 60),
        deep: sleep.score.slow_wave_sleep_time_milli / (1000 * 60),
      },
      latency: sleep.score.sleep_latency_milli / (1000 * 60),
      disturbances: sleep.score.sleep_disturbances,
      timeInBed: timeInBedHours,
      restfulness: sleep.score.sleep_consistency_percentage,
    };
  }
  
  private calculateHeartRateZones(maxHR: number): any {
    return {
      zone1: Math.round(maxHR * 0.5),
      zone2: Math.round(maxHR * 0.6),
      zone3: Math.round(maxHR * 0.7),
      zone4: Math.round(maxHR * 0.8),
      zone5: Math.round(maxHR * 0.9),
    };
  }
  
  private async calculateTrainingLoad(): Promise<TrainingLoadData> {
    // Get strain data for the past 28 days
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const strainData = await this.getStrainData(startDate, endDate);
    
    // Calculate acute (7-day) and chronic (28-day) loads
    const sevenDaysAgo = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const acuteStrains = strainData.filter(s => new Date(s.created_at) >= sevenDaysAgo);
    const chronicStrains = strainData;
    
    const acuteLoad = acuteStrains.reduce((sum, s) => sum + s.score.strain, 0) / 7;
    const chronicLoad = chronicStrains.reduce((sum, s) => sum + s.score.strain, 0) / 28;
    
    const ratio = chronicLoad > 0 ? acuteLoad / chronicLoad : 1;
    
    let status: 'productive' | 'maintaining' | 'recovery' | 'overreaching' | 'detraining';
    let recommendation: string;
    
    if (ratio > 1.5) {
      status = 'overreaching';
      recommendation = 'High acute load. Risk of overtraining. Consider reducing intensity.';
    } else if (ratio > 1.2) {
      status = 'productive';
      recommendation = 'Optimal training load progression. Continue current approach.';
    } else if (ratio > 0.8) {
      status = 'maintaining';
      recommendation = 'Maintaining fitness. Consider slight increase if feeling good.';
    } else if (ratio > 0.5) {
      status = 'recovery';
      recommendation = 'Recovery phase. Good for adaptation and supercompensation.';
    } else {
      status = 'detraining';
      recommendation = 'Very low training load. Risk of fitness loss.';
    }
    
    return {
      acute: acuteLoad,
      chronic: chronicLoad,
      ratio,
      status,
      recommendation,
    };
  }
  
  private calculateReadinessScore(metrics: Partial<UnifiedMetrics>): number {
    let score = 50;
    
    // Recovery contributes 40%
    if (metrics.recoveryScore) {
      score = metrics.recoveryScore * 0.4;
    }
    
    // Sleep contributes 30%
    if (metrics.sleep?.score) {
      score += metrics.sleep.score * 0.3;
    }
    
    // HRV trend contributes 20%
    if (metrics.heartRateVariability) {
      const hrvContribution = metrics.heartRateVariability.trend === 'improving' ? 20 :
                              metrics.heartRateVariability.trend === 'stable' ? 15 : 10;
      score += hrvContribution;
    }
    
    // Strain balance contributes 10%
    if (metrics.strainScore) {
      const strainBalance = metrics.strainScore < 10 ? 10 :
                           metrics.strainScore < 15 ? 7 : 5;
      score += strainBalance;
    }
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }
  
  async exportWorkout(workout: WorkoutExport): Promise<boolean> {
    // WHOOP doesn't support workout import via API
    console.log('WHOOP does not support workout import');
    return false;
  }
  
  async getDeviceInfo(): Promise<Partial<WearableDevice>> {
    try {
      const response = await this.api.get('/v1/user/profile');
      
      return {
        name: 'WHOOP Strap',
        firmware: response.data.device_version || 'Unknown',
      };
    } catch (error) {
      return {
        name: 'WHOOP Strap',
      };
    }
  }
  
  async getRecoveryMetrics(): Promise<RecoveryMetrics | null> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    
    const recovery = await this.getRecoveryData(startDate, endDate);
    const sleep = await this.getSleepData(startDate, endDate);
    const strain = await this.getStrainData(startDate, endDate);
    
    if (!recovery[0]) return null;
    
    const latestRecovery = recovery[0];
    const latestSleep = sleep[0];
    const latestStrain = strain[0];
    
    const factors: RecoveryFactor[] = [
      {
        name: 'HRV',
        impact: latestRecovery.score.hrv_rmssd_milli > 50 ? 'positive' : 
                latestRecovery.score.hrv_rmssd_milli > 30 ? 'neutral' : 'negative',
        value: latestRecovery.score.hrv_rmssd_milli,
        description: `HRV: ${latestRecovery.score.hrv_rmssd_milli}ms`,
      },
      {
        name: 'Resting Heart Rate',
        impact: latestRecovery.score.resting_heart_rate < 55 ? 'positive' :
                latestRecovery.score.resting_heart_rate < 65 ? 'neutral' : 'negative',
        value: latestRecovery.score.resting_heart_rate,
        description: `RHR: ${latestRecovery.score.resting_heart_rate} bpm`,
      },
    ];
    
    if (latestSleep) {
      factors.push({
        name: 'Sleep Performance',
        impact: latestSleep.score.sleep_performance_percentage > 85 ? 'positive' :
                latestSleep.score.sleep_performance_percentage > 70 ? 'neutral' : 'negative',
        value: latestSleep.score.sleep_performance_percentage,
        description: `Sleep: ${latestSleep.score.sleep_performance_percentage}%`,
      });
    }
    
    if (latestStrain) {
      factors.push({
        name: 'Yesterday\'s Strain',
        impact: latestStrain.score.strain < 10 ? 'positive' :
                latestStrain.score.strain < 15 ? 'neutral' : 'negative',
        value: latestStrain.score.strain,
        description: `Strain: ${latestStrain.score.strain.toFixed(1)}`,
      });
    }
    
    return {
      score: latestRecovery.score.recovery_score,
      hrv: {
        value: latestRecovery.score.hrv_rmssd_milli,
        trend: 'stable',
        baseline: latestRecovery.score.hrv_rmssd_milli,
        percentile: 50,
      },
      restingHeartRate: latestRecovery.score.resting_heart_rate,
      sleepQuality: latestSleep?.score.sleep_performance_percentage || 0,
      recommendation: this.mapWhoopToTrainingRecommendation(latestRecovery.score.recovery_score),
      factors,
    };
  }
  
  private mapWhoopToTrainingRecommendation(recoveryScore: number): string {
    if (recoveryScore >= 67) {
      return 'Green recovery (67-100%). Your body has adapted well. This is an optimal day for strenuous activity.';
    } else if (recoveryScore >= 34) {
      return 'Yellow recovery (34-66%). Your body is maintaining. Moderate strain recommended.';
    } else {
      return 'Red recovery (0-33%). Your body needs rest. Prioritize recovery activities today.';
    }
  }
  
  // OAuth Authentication
  private async authenticate(): Promise<void> {
    // This would typically open a web view for OAuth
    // For now, we'll assume the API key is provided
    if (!this.apiKey) {
      throw new Error('WHOOP API key required for authentication');
    }
    
    // Exchange API key for tokens (simplified)
    try {
      const response = await axios.post(WHOOP_TOKEN_URL, {
        grant_type: 'api_key',
        api_key: this.apiKey,
      });
      
      this.tokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: Date.now() + response.data.expires_in * 1000,
        scope: response.data.scope,
      };
      
      await AsyncStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(this.tokens));
      this.isConnected = true;
      
    } catch (error) {
      console.error('WHOOP authentication failed:', error);
      throw error;
    }
  }
  
  private async refreshToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post(WHOOP_TOKEN_URL, {
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refresh_token,
      });
      
      this.tokens = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || this.tokens.refresh_token,
        expires_at: Date.now() + response.data.expires_in * 1000,
        scope: response.data.scope,
      };
      
      await AsyncStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(this.tokens));
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.isConnected = false;
      throw error;
    }
  }
  
  private async ensureValidToken(): Promise<void> {
    if (!this.tokens) return;
    
    if (Date.now() >= this.tokens.expires_at - 60000) {
      await this.refreshToken();
    }
  }
  
  private async verifyConnection(): Promise<boolean> {
    if (!this.tokens) return false;
    
    try {
      await this.ensureValidToken();
      await this.api.get('/v1/user/profile');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Webhook Support
  private async setupWebhooks(): Promise<void> {
    if (!this.webhookUrl) {
      // Generate webhook URL (would need backend support)
      this.webhookUrl = `https://api.catalyft.com/webhooks/whoop/${this.deviceId}`;
    }
    
    try {
      await this.api.post('/v1/webhooks', {
        url: this.webhookUrl,
        events: ['recovery.updated', 'sleep.updated', 'workout.created', 'strain.updated'],
      });
      
      console.log('WHOOP webhooks configured');
    } catch (error) {
      console.error('Failed to setup WHOOP webhooks:', error);
    }
  }
  
  private async removeWebhooks(): Promise<void> {
    if (!this.webhookUrl) return;
    
    try {
      await this.api.delete('/v1/webhooks', {
        data: { url: this.webhookUrl },
      });
    } catch (error) {
      console.error('Failed to remove WHOOP webhooks:', error);
    }
  }
  
  async handleWebhookEvent(event: any): Promise<void> {
    // Process webhook events for real-time updates
    switch (event.type) {
      case 'recovery.updated':
        this.notifyRealTimeCallbacks({
          recoveryScore: event.data.recovery_score,
          heartRateVariability: {
            value: event.data.hrv_rmssd_milli,
            trend: 'stable',
            baseline: event.data.hrv_rmssd_milli,
            percentile: 50,
          },
        });
        break;
        
      case 'strain.updated':
        this.notifyRealTimeCallbacks({
          strainScore: event.data.strain,
        });
        break;
        
      case 'sleep.updated':
        const sleepData = this.processSleepData(event.data);
        this.notifyRealTimeCallbacks({
          sleep: sleepData,
        });
        break;
        
      case 'workout.created':
        // Process new workout
        break;
    }
  }
}