import AsyncStorage from '@react-native-async-storage/async-storage';
import { WearableService, RealTimeDataCallback } from './WearableService';
import { AppleHealthKitService } from './AppleHealthKit';
import { WhoopService } from './WhoopService';
import { GarminService } from './GarminService';
import { GoogleFitService } from './GoogleFitService';
import { FitbitService } from './FitbitService';
import {
  WearableDevice,
  WearableType,
  UnifiedMetrics,
  SyncResult,
  DataConflict,
  WorkoutExport,
  RecoveryMetrics,
  TrainingRecommendation,
  HeartRateData,
  SleepData,
  TrainingLoadData,
} from '../../types/wearables';
import { supabase } from '../../services/supabase';

const STORAGE_KEY = '@catalyft_wearable_devices';

export class WearableManager {
  private static instance: WearableManager;
  private devices: Map<string, WearableService> = new Map();
  private connectedDevices: Map<string, WearableDevice> = new Map();
  private syncInProgress: Set<string> = new Set();
  private unifiedMetricsCache?: UnifiedMetrics;
  private lastUnifiedMetricsUpdate?: Date;
  
  private constructor() {
    this.loadDevices();
  }
  
  static getInstance(): WearableManager {
    if (!WearableManager.instance) {
      WearableManager.instance = new WearableManager();
    }
    return WearableManager.instance;
  }
  
  // Device Management
  async addDevice(type: WearableType, config?: any): Promise<WearableDevice> {
    const deviceId = `${type}_${Date.now()}`;
    let service: WearableService;
    
    switch (type) {
      case 'apple_watch':
        service = new AppleHealthKitService(deviceId);
        break;
      case 'whoop':
        service = new WhoopService(deviceId, config?.apiKey);
        break;
      case 'garmin':
        service = new GarminService(deviceId, config);
        break;
      case 'google_fit':
        service = new GoogleFitService(deviceId);
        break;
      case 'fitbit':
        service = new FitbitService(deviceId, config);
        break;
      default:
        throw new Error(`Unsupported device type: ${type}`);
    }
    
    // Request permissions and connect
    const permissions = await service.requestPermissions();
    if (!permissions) {
      throw new Error('Permissions not granted');
    }
    
    const connected = await service.connect({
      requestPermissions: false,
      backgroundSync: true,
      realTimeUpdates: true,
    });
    
    if (!connected) {
      throw new Error('Failed to connect to device');
    }
    
    const deviceInfo = await service.getDeviceInfo();
    const device: WearableDevice = {
      id: deviceId,
      type,
      name: deviceInfo.name || `${type} Device`,
      connected: true,
      lastSync: new Date(),
      battery: deviceInfo.battery,
      firmware: deviceInfo.firmware,
      capabilities: service.getCapabilities(),
      syncSettings: service.getSyncSettings(),
      status: {
        isConnected: true,
        isSyncing: false,
        pendingSyncItems: 0,
        dataQuality: 'excellent',
      },
    };
    
    this.devices.set(deviceId, service);
    this.connectedDevices.set(deviceId, device);
    await this.saveDevices();
    
    // Perform initial sync
    this.syncDevice(deviceId);
    
    // Store device info in Supabase
    await this.storeDeviceInSupabase(device);
    
    return device;
  }
  
  async removeDevice(deviceId: string): Promise<void> {
    const service = this.devices.get(deviceId);
    if (service) {
      await service.disconnect();
      this.devices.delete(deviceId);
      this.connectedDevices.delete(deviceId);
      await this.saveDevices();
      await this.removeDeviceFromSupabase(deviceId);
    }
  }
  
  async reconnectDevice(deviceId: string): Promise<boolean> {
    const service = this.devices.get(deviceId);
    if (!service) return false;
    
    try {
      const connected = await service.connect();
      if (connected) {
        const device = this.connectedDevices.get(deviceId);
        if (device) {
          device.connected = true;
          device.status.isConnected = true;
          await this.saveDevices();
        }
      }
      return connected;
    } catch (error) {
      console.error(`Failed to reconnect device ${deviceId}:`, error);
      return false;
    }
  }
  
  // Sync Operations
  async syncAllDevices(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const promises = Array.from(this.devices.keys()).map(deviceId =>
      this.syncDevice(deviceId)
    );
    
    const syncResults = await Promise.allSettled(promises);
    
    syncResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      } else if (result.status === 'rejected') {
        const deviceId = Array.from(this.devices.keys())[index];
        results.push({
          deviceId,
          success: false,
          timestamp: new Date(),
          itemsSynced: 0,
          errors: [result.reason?.message || 'Unknown error'],
        });
      }
    });
    
    // Update unified metrics after sync
    await this.updateUnifiedMetrics();
    
    return results;
  }
  
  async syncDevice(deviceId: string): Promise<SyncResult | null> {
    if (this.syncInProgress.has(deviceId)) {
      console.log(`Sync already in progress for device ${deviceId}`);
      return null;
    }
    
    const service = this.devices.get(deviceId);
    const device = this.connectedDevices.get(deviceId);
    
    if (!service || !device) return null;
    
    try {
      this.syncInProgress.add(deviceId);
      device.status.isSyncing = true;
      
      // Determine sync period based on last sync
      const endDate = new Date();
      const startDate = device.lastSync || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await service.syncData(startDate, endDate);
      
      // Update device status
      device.lastSync = new Date();
      device.status.lastSuccessfulSync = new Date();
      device.status.isSyncing = false;
      
      if (result.success && result.metrics) {
        // Store synced data in Supabase
        await this.storeSyncedDataInSupabase(deviceId, result.metrics);
      }
      
      await this.saveDevices();
      return result;
      
    } catch (error) {
      console.error(`Sync failed for device ${deviceId}:`, error);
      if (device) {
        device.status.isSyncing = false;
        device.status.lastError = error instanceof Error ? error.message : 'Unknown error';
      }
      return {
        deviceId,
        success: false,
        timestamp: new Date(),
        itemsSynced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    } finally {
      this.syncInProgress.delete(deviceId);
    }
  }
  
  // Unified Metrics
  async getUnifiedMetrics(forceRefresh: boolean = false): Promise<UnifiedMetrics> {
    if (!forceRefresh && 
        this.unifiedMetricsCache && 
        this.lastUnifiedMetricsUpdate &&
        Date.now() - this.lastUnifiedMetricsUpdate.getTime() < 5 * 60 * 1000) {
      return this.unifiedMetricsCache;
    }
    
    await this.updateUnifiedMetrics();
    return this.unifiedMetricsCache!;
  }
  
  private async updateUnifiedMetrics(): Promise<void> {
    const metricsArray: Partial<UnifiedMetrics>[] = [];
    const sources: WearableType[] = [];
    
    for (const [deviceId, service] of this.devices) {
      try {
        const metrics = await service.getLatestMetrics();
        if (metrics && Object.keys(metrics).length > 0) {
          metricsArray.push(metrics);
          sources.push(service.getDeviceType());
        }
      } catch (error) {
        console.error(`Failed to get metrics from device ${deviceId}:`, error);
      }
    }
    
    this.unifiedMetricsCache = this.combineMetrics(metricsArray, sources);
    this.lastUnifiedMetricsUpdate = new Date();
    
    // Generate recommendations based on unified metrics
    this.unifiedMetricsCache.recommendations = await this.generateRecommendations(this.unifiedMetricsCache);
  }
  
  private combineMetrics(metricsArray: Partial<UnifiedMetrics>[], sources: WearableType[]): UnifiedMetrics {
    const combined: UnifiedMetrics = {
      timestamp: new Date(),
      source: sources,
      steps: 0,
      distance: 0,
      calories: {
        total: 0,
        active: 0,
        resting: 0,
        bmr: 0,
      },
      activeMinutes: 0,
    };
    
    // Priority order for different metrics
    const priorityMap: Record<string, WearableType[]> = {
      heartRate: ['apple_watch', 'whoop', 'garmin', 'fitbit', 'google_fit'],
      sleep: ['whoop', 'oura', 'garmin', 'fitbit', 'apple_watch'],
      recovery: ['whoop', 'garmin', 'oura'],
      steps: ['apple_watch', 'fitbit', 'garmin', 'google_fit'],
    };
    
    // Combine heart rate data
    const hrMetrics = this.selectBestMetric(metricsArray, 'heartRate', priorityMap.heartRate, sources);
    if (hrMetrics?.heartRate) {
      combined.heartRate = hrMetrics.heartRate;
    }
    
    // Combine HRV data
    const hrvMetrics = this.selectBestMetric(metricsArray, 'heartRateVariability', priorityMap.heartRate, sources);
    if (hrvMetrics?.heartRateVariability) {
      combined.heartRateVariability = hrvMetrics.heartRateVariability;
    }
    
    // Combine sleep data
    const sleepMetrics = this.selectBestMetric(metricsArray, 'sleep', priorityMap.sleep, sources);
    if (sleepMetrics?.sleep) {
      combined.sleep = sleepMetrics.sleep;
    }
    
    // Combine recovery scores
    const recoveryMetrics = this.selectBestMetric(metricsArray, 'recoveryScore', priorityMap.recovery, sources);
    if (recoveryMetrics?.recoveryScore) {
      combined.recoveryScore = recoveryMetrics.recoveryScore;
    }
    
    // Aggregate activity metrics (sum from all devices, avoiding duplicates)
    const processedDevices = new Set<WearableType>();
    metricsArray.forEach((metrics, index) => {
      const source = sources[index];
      if (!processedDevices.has(source)) {
        processedDevices.add(source);
        
        combined.steps = Math.max(combined.steps, metrics.steps || 0);
        combined.distance = Math.max(combined.distance, metrics.distance || 0);
        combined.activeMinutes = Math.max(combined.activeMinutes, metrics.activeMinutes || 0);
        
        if (metrics.calories) {
          combined.calories.total = Math.max(combined.calories.total, metrics.calories.total || 0);
          combined.calories.active = Math.max(combined.calories.active, metrics.calories.active || 0);
          combined.calories.resting = Math.max(combined.calories.resting, metrics.calories.resting || 0);
        }
      }
    });
    
    // Copy over other metrics from highest priority device
    const primaryMetrics = metricsArray[0];
    if (primaryMetrics) {
      combined.bloodOxygen = primaryMetrics.bloodOxygen;
      combined.respiratoryRate = primaryMetrics.respiratoryRate;
      combined.temperature = primaryMetrics.temperature;
      combined.strainScore = primaryMetrics.strainScore;
      combined.stressLevel = primaryMetrics.stressLevel;
      combined.bodyBattery = primaryMetrics.bodyBattery;
      combined.trainingLoad = primaryMetrics.trainingLoad;
      combined.vo2Max = primaryMetrics.vo2Max;
      combined.performanceCondition = primaryMetrics.performanceCondition;
    }
    
    return combined;
  }
  
  private selectBestMetric(
    metricsArray: Partial<UnifiedMetrics>[],
    field: keyof UnifiedMetrics,
    priority: WearableType[],
    sources: WearableType[]
  ): Partial<UnifiedMetrics> | null {
    for (const preferredSource of priority) {
      const index = sources.indexOf(preferredSource);
      if (index !== -1 && metricsArray[index]?.[field]) {
        return metricsArray[index];
      }
    }
    
    // Fallback to first available
    for (const metrics of metricsArray) {
      if (metrics[field]) {
        return metrics;
      }
    }
    
    return null;
  }
  
  // Real-time Data
  async getRealTimeHeartRate(): Promise<number | null> {
    // Try devices in priority order
    const priorityOrder: WearableType[] = ['apple_watch', 'garmin', 'whoop', 'fitbit'];
    
    for (const deviceType of priorityOrder) {
      const device = Array.from(this.devices.values()).find(
        service => service.getDeviceType() === deviceType && service.getConnectionStatus()
      );
      
      if (device) {
        try {
          const metrics = await device.getLatestMetrics();
          if (metrics.heartRate?.current) {
            return metrics.heartRate.current;
          }
        } catch (error) {
          console.error(`Failed to get heart rate from ${deviceType}:`, error);
        }
      }
    }
    
    return null;
  }
  
  subscribeToRealTimeData(callback: RealTimeDataCallback): void {
    // Subscribe to all connected devices
    this.devices.forEach(service => {
      if (service.getConnectionStatus()) {
        service.subscribeToRealTimeData(callback);
      }
    });
  }
  
  unsubscribeFromRealTimeData(callback: RealTimeDataCallback): void {
    this.devices.forEach(service => {
      service.unsubscribeFromRealTimeData(callback);
    });
  }
  
  // Workout Export
  async exportWorkout(workout: WorkoutExport): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [deviceId, service] of this.devices) {
      const device = this.connectedDevices.get(deviceId);
      if (device?.capabilities.workoutExport && device.syncSettings.dataTypes.workouts) {
        try {
          const success = await service.exportWorkout(workout);
          results.set(deviceId, success);
        } catch (error) {
          console.error(`Failed to export workout to device ${deviceId}:`, error);
          results.set(deviceId, false);
        }
      }
    }
    
    return results;
  }
  
  // Recovery Metrics
  async getCombinedRecoveryScore(): Promise<RecoveryMetrics | null> {
    const recoveryMetrics: RecoveryMetrics[] = [];
    
    for (const service of this.devices.values()) {
      try {
        const recovery = await service.getRecoveryMetrics();
        if (recovery) {
          recoveryMetrics.push(recovery);
        }
      } catch (error) {
        console.error('Failed to get recovery metrics:', error);
      }
    }
    
    if (recoveryMetrics.length === 0) return null;
    
    // Combine recovery metrics with weighted average
    const weights = {
      whoop: 0.4,
      garmin: 0.3,
      oura: 0.2,
      default: 0.1,
    };
    
    let totalWeight = 0;
    let weightedScore = 0;
    let hrvSum = 0;
    let hrvCount = 0;
    
    recoveryMetrics.forEach(metrics => {
      const weight = weights.default; // Would need device type to use specific weights
      weightedScore += metrics.score * weight;
      totalWeight += weight;
      
      if (metrics.hrv) {
        hrvSum += metrics.hrv.value;
        hrvCount++;
      }
    });
    
    const combinedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const avgHrv = hrvCount > 0 ? hrvSum / hrvCount : 0;
    
    return {
      score: Math.round(combinedScore),
      hrv: recoveryMetrics[0].hrv, // Use first available HRV data
      restingHeartRate: recoveryMetrics[0].restingHeartRate,
      sleepQuality: recoveryMetrics[0].sleepQuality,
      recommendation: this.getRecoveryRecommendation(combinedScore),
      factors: this.analyzeRecoveryFactors(recoveryMetrics),
    };
  }
  
  private getRecoveryRecommendation(score: number): string {
    if (score >= 80) {
      return 'Excellent recovery! Ready for high-intensity training.';
    } else if (score >= 60) {
      return 'Good recovery. Moderate to high intensity training recommended.';
    } else if (score >= 40) {
      return 'Fair recovery. Consider moderate intensity or active recovery.';
    } else {
      return 'Poor recovery. Rest day or light activity recommended.';
    }
  }
  
  private analyzeRecoveryFactors(metrics: RecoveryMetrics[]): any[] {
    // Analyze and combine recovery factors from multiple devices
    const factors: any[] = [];
    
    metrics.forEach(m => {
      if (m.factors) {
        factors.push(...m.factors);
      }
    });
    
    return factors;
  }
  
  // Recommendations
  private async generateRecommendations(metrics: UnifiedMetrics): Promise<TrainingRecommendation[]> {
    const recommendations: TrainingRecommendation[] = [];
    
    // Recovery-based recommendations
    if (metrics.recoveryScore !== undefined) {
      if (metrics.recoveryScore < 40) {
        recommendations.push({
          type: 'recovery',
          priority: 'high',
          title: 'Prioritize Recovery',
          description: 'Your recovery score is low. Consider taking a rest day or doing light activity.',
          action: 'Schedule a recovery session',
          reasoning: `Recovery score is ${metrics.recoveryScore}%, below the threshold for intense training.`,
        });
      } else if (metrics.recoveryScore > 80) {
        recommendations.push({
          type: 'intensity',
          priority: 'high',
          title: 'High Intensity Day',
          description: 'Your recovery is excellent. Today is perfect for challenging workouts.',
          action: 'Plan a high-intensity session',
          reasoning: `Recovery score is ${metrics.recoveryScore}%, optimal for intense training.`,
        });
      }
    }
    
    // Sleep-based recommendations
    if (metrics.sleep) {
      if (metrics.sleep.duration < 6) {
        recommendations.push({
          type: 'sleep',
          priority: 'high',
          title: 'Improve Sleep Duration',
          description: 'You got less than 6 hours of sleep. This may impact your recovery and performance.',
          action: 'Aim for 7-9 hours tonight',
          reasoning: `Only ${metrics.sleep.duration.toFixed(1)} hours of sleep recorded.`,
        });
      }
      
      if (metrics.sleep.efficiency && metrics.sleep.efficiency < 85) {
        recommendations.push({
          type: 'sleep',
          priority: 'medium',
          title: 'Improve Sleep Quality',
          description: 'Your sleep efficiency is below optimal. Consider improving your sleep environment.',
          action: 'Review sleep hygiene practices',
          reasoning: `Sleep efficiency is ${metrics.sleep.efficiency}%, below the 85% target.`,
        });
      }
    }
    
    // HRV-based recommendations
    if (metrics.heartRateVariability) {
      if (metrics.heartRateVariability.trend === 'declining') {
        recommendations.push({
          type: 'recovery',
          priority: 'medium',
          title: 'HRV Declining',
          description: 'Your HRV trend is declining, which may indicate accumulated stress.',
          action: 'Consider reducing training intensity',
          reasoning: 'HRV has been trending down over the past week.',
        });
      }
    }
    
    // Training load recommendations
    if (metrics.trainingLoad) {
      if (metrics.trainingLoad.ratio > 1.5) {
        recommendations.push({
          type: 'intensity',
          priority: 'high',
          title: 'High Training Load',
          description: 'Your acute training load is significantly higher than chronic. Risk of overtraining.',
          action: 'Reduce training volume this week',
          reasoning: `Training load ratio is ${metrics.trainingLoad.ratio.toFixed(2)}, above the safe threshold of 1.5.`,
        });
      } else if (metrics.trainingLoad.ratio < 0.8) {
        recommendations.push({
          type: 'intensity',
          priority: 'medium',
          title: 'Low Training Load',
          description: 'Your recent training load is low. You may be detraining.',
          action: 'Gradually increase training volume',
          reasoning: `Training load ratio is ${metrics.trainingLoad.ratio.toFixed(2)}, below the maintenance threshold.`,
        });
      }
    }
    
    return recommendations;
  }
  
  // Conflict Resolution
  handleConflicts(conflicts: DataConflict[]): DataConflict[] {
    return conflicts.map(conflict => {
      // Apply conflict resolution strategy
      const device = Array.from(this.connectedDevices.values()).find(
        d => d.syncSettings.conflictResolution
      );
      
      const strategy = device?.syncSettings.conflictResolution || 'device';
      
      switch (strategy) {
        case 'device':
          conflict.resolution = 'device';
          break;
        case 'catalyft':
          conflict.resolution = 'catalyft';
          break;
        case 'manual':
          // Would need user input here
          conflict.resolution = undefined;
          break;
        default:
          conflict.resolution = 'device';
      }
      
      return conflict;
    });
  }
  
  // Persistence
  private async loadDevices(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const devices = JSON.parse(stored) as WearableDevice[];
        // Reconnect to previously connected devices
        for (const device of devices) {
          if (device.connected) {
            try {
              await this.addDevice(device.type);
            } catch (error) {
              console.error(`Failed to reconnect to ${device.type}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }
  
  private async saveDevices(): Promise<void> {
    try {
      const devices = Array.from(this.connectedDevices.values());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Failed to save devices:', error);
    }
  }
  
  // Supabase Integration
  private async storeDeviceInSupabase(device: WearableDevice): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('wearable_devices').upsert({
        id: device.id,
        user_id: user.id,
        type: device.type,
        name: device.name,
        capabilities: device.capabilities,
        sync_settings: device.syncSettings,
        last_sync: device.lastSync,
        created_at: new Date(),
      });
    } catch (error) {
      console.error('Failed to store device in Supabase:', error);
    }
  }
  
  private async removeDeviceFromSupabase(deviceId: string): Promise<void> {
    try {
      await supabase.from('wearable_devices').delete().eq('id', deviceId);
    } catch (error) {
      console.error('Failed to remove device from Supabase:', error);
    }
  }
  
  private async storeSyncedDataInSupabase(deviceId: string, metrics: Partial<UnifiedMetrics>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('wearable_metrics').insert({
        user_id: user.id,
        device_id: deviceId,
        metrics,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to store synced data in Supabase:', error);
    }
  }
  
  // Getters
  getDevices(): WearableDevice[] {
    return Array.from(this.connectedDevices.values());
  }
  
  getDevice(deviceId: string): WearableDevice | undefined {
    return this.connectedDevices.get(deviceId);
  }
  
  getDeviceService(deviceId: string): WearableService | undefined {
    return this.devices.get(deviceId);
  }
  
  isDeviceConnected(deviceId: string): boolean {
    const device = this.connectedDevices.get(deviceId);
    return device?.connected || false;
  }
  
  isSyncing(deviceId?: string): boolean {
    if (deviceId) {
      return this.syncInProgress.has(deviceId);
    }
    return this.syncInProgress.size > 0;
  }
}