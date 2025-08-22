import {
  WearableDevice,
  SyncResult,
  UnifiedMetrics,
  WorkoutExport,
  WearablePermissions,
  RecoveryMetrics,
  DeviceCapabilities,
  SyncSettings,
  WearableType,
} from '../../types/wearables';

export interface RealTimeDataCallback {
  (data: Partial<UnifiedMetrics>): void;
}

export interface ConnectionOptions {
  requestPermissions?: boolean;
  backgroundSync?: boolean;
  realTimeUpdates?: boolean;
}

export abstract class WearableService {
  protected deviceId: string;
  protected deviceType: WearableType;
  protected isConnected: boolean = false;
  protected realTimeCallbacks: Set<RealTimeDataCallback> = new Set();
  protected syncSettings: SyncSettings;
  protected lastSyncTime?: Date;
  
  constructor(deviceId: string, deviceType: WearableType) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.syncSettings = this.getDefaultSyncSettings();
  }
  
  // Abstract methods that must be implemented by each service
  abstract connect(options?: ConnectionOptions): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract requestPermissions(): Promise<WearablePermissions>;
  abstract checkPermissions(): Promise<WearablePermissions>;
  abstract getCapabilities(): DeviceCapabilities;
  abstract syncData(startDate: Date, endDate: Date): Promise<SyncResult>;
  abstract exportWorkout(workout: WorkoutExport): Promise<boolean>;
  abstract getDeviceInfo(): Promise<Partial<WearableDevice>>;
  
  // Optional methods with default implementations
  async subscribeToRealTimeData(callback: RealTimeDataCallback): Promise<void> {
    this.realTimeCallbacks.add(callback);
    if (this.realTimeCallbacks.size === 1) {
      await this.startRealTimeUpdates();
    }
  }
  
  async unsubscribeFromRealTimeData(callback: RealTimeDataCallback): Promise<void> {
    this.realTimeCallbacks.delete(callback);
    if (this.realTimeCallbacks.size === 0) {
      await this.stopRealTimeUpdates();
    }
  }
  
  protected async startRealTimeUpdates(): Promise<void> {
    // Override in subclasses that support real-time data
  }
  
  protected async stopRealTimeUpdates(): Promise<void> {
    // Override in subclasses that support real-time data
  }
  
  protected notifyRealTimeCallbacks(data: Partial<UnifiedMetrics>): void {
    this.realTimeCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in real-time callback:', error);
      }
    });
  }
  
  // Common utility methods
  async getLatestMetrics(): Promise<Partial<UnifiedMetrics>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const result = await this.syncData(startDate, endDate);
    return result.metrics || {};
  }
  
  async getRecoveryMetrics(): Promise<RecoveryMetrics | null> {
    // Default implementation - override in services that support recovery metrics
    return null;
  }
  
  async startWorkoutSession(workoutType: string): Promise<string | null> {
    // Default implementation - override in services that support live workout tracking
    return null;
  }
  
  async endWorkoutSession(sessionId: string): Promise<WorkoutExport | null> {
    // Default implementation - override in services that support live workout tracking
    return null;
  }
  
  updateSyncSettings(settings: Partial<SyncSettings>): void {
    this.syncSettings = { ...this.syncSettings, ...settings };
  }
  
  getSyncSettings(): SyncSettings {
    return this.syncSettings;
  }
  
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  getDeviceId(): string {
    return this.deviceId;
  }
  
  getDeviceType(): WearableType {
    return this.deviceType;
  }
  
  getLastSyncTime(): Date | undefined {
    return this.lastSyncTime;
  }
  
  protected getDefaultSyncSettings(): SyncSettings {
    return {
      autoSync: true,
      syncFrequency: '30min',
      wifiOnly: false,
      backgroundSync: true,
      dataTypes: {
        workouts: true,
        heartRate: true,
        sleep: true,
        steps: true,
        calories: true,
        weight: true,
        nutrition: false,
        recovery: true,
      },
      conflictResolution: 'device',
    };
  }
  
  // Helper method for handling API rate limits
  protected async rateLimitedRequest<T>(
    request: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await request();
      } catch (error: any) {
        if (error.statusCode === 429 && i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }
  
  // Helper method for data validation
  protected validateMetrics(metrics: Partial<UnifiedMetrics>): Partial<UnifiedMetrics> {
    const validated = { ...metrics };
    
    // Validate heart rate
    if (validated.heartRate) {
      if (validated.heartRate.current && (validated.heartRate.current < 30 || validated.heartRate.current > 250)) {
        delete validated.heartRate.current;
      }
      if (validated.heartRate.resting && (validated.heartRate.resting < 30 || validated.heartRate.resting > 120)) {
        delete validated.heartRate.resting;
      }
    }
    
    // Validate steps
    if (validated.steps && (validated.steps < 0 || validated.steps > 100000)) {
      validated.steps = 0;
    }
    
    // Validate sleep duration (in hours)
    if (validated.sleep?.duration && (validated.sleep.duration < 0 || validated.sleep.duration > 24)) {
      delete validated.sleep;
    }
    
    return validated;
  }
}