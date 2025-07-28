import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'fitbit' | 'garmin' | 'whoop' | 'polar' | 'samsung_health';
  isConnected: boolean;
  lastSync: string;
  capabilities: WearableCapability[];
}

export interface WearableCapability {
  type: 'heart_rate' | 'hrv' | 'calories' | 'steps' | 'sleep' | 'strain';
  realTime: boolean;
  accuracy: 'high' | 'medium' | 'low';
}

export interface HeartRateData {
  timestamp: Date;
  bpm: number;
  confidence: number; // 0-1 confidence in reading
  source: string; // device identifier
}

export interface BiometricProfile {
  restingHeartRate: number;
  maxHeartRate: number;
  age: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  hrv_baseline?: number;
}

export interface RealTimeMetrics {
  heartRate: number;
  heartRateReserve: number; // Percentage of max HR reserve
  timeInZones: {
    zone1: number; // Recovery (50-60% HRR)
    zone2: number; // Aerobic (60-70% HRR)
    zone3: number; // Tempo (70-80% HRR)
    zone4: number; // Lactate Threshold (80-90% HRR)
    zone5: number; // VO2 Max (90-100% HRR)
  };
  averageHR: number;
  calories: number;
  strain: number; // Real-time calculated strain
}

interface WearableDataHookReturn {
  // Connection state
  connectedDevices: WearableDevice[];
  isConnecting: boolean;
  connectionError: string | null;
  
  // Real-time data
  currentHeartRate: number | null;
  realTimeMetrics: RealTimeMetrics | null;
  biometricProfile: BiometricProfile | null;
  
  // Actions
  connectDevice: (deviceType: WearableDevice['type']) => Promise<void>;
  disconnectDevice: (deviceId: string) => Promise<void>;
  startRealTimeMonitoring: () => Promise<void>;
  stopRealTimeMonitoring: () => void;
  updateBiometricProfile: (profile: Partial<BiometricProfile>) => Promise<void>;
  
  // State
  isMonitoring: boolean;
  lastDataUpdate: Date | null;
}

export const useWearableData = (): WearableDataHookReturn => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  // State management
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [lastDataUpdate, setLastDataUpdate] = useState<Date | null>(null);
  
  // Refs for cleanup
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const deviceConnectionRef = useRef<any>(null);

  // Get connected devices
  const { data: connectedDevices = [] } = useQuery({
    queryKey: ['wearable-devices', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('wearable_devices')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_connected', true);
      
      if (error) throw error;
      return data as WearableDevice[];
    },
    enabled: !!profile?.id,
  });

  // Get biometric profile
  const { data: biometricProfile } = useQuery({
    queryKey: ['biometric-profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('biometric_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as BiometricProfile;
    },
    enabled: !!profile?.id,
  });

  // Heart rate zone calculations
  const calculateHeartRateZones = useCallback((currentHR: number, profile: BiometricProfile) => {
    const { restingHeartRate, maxHeartRate } = profile;
    const hrReserve = maxHeartRate - restingHeartRate;
    const hrReservePercent = ((currentHR - restingHeartRate) / hrReserve) * 100;
    
    return {
      heartRateReserve: Math.max(0, Math.min(100, hrReservePercent)),
      zone: getHeartRateZone(hrReservePercent),
    };
  }, []);

  const getHeartRateZone = (hrReservePercent: number): keyof RealTimeMetrics['timeInZones'] => {
    if (hrReservePercent >= 90) return 'zone5';
    if (hrReservePercent >= 80) return 'zone4';
    if (hrReservePercent >= 70) return 'zone3';
    if (hrReservePercent >= 60) return 'zone2';
    return 'zone1';
  };

  // Device connection handlers
  const connectAppleWatch = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Check if HealthKit is available
      if (!window.webkit?.messageHandlers?.healthKit) {
        throw new Error('HealthKit not available on this device');
      }

      // Request authorization for heart rate data
      const authResult = await new Promise((resolve, reject) => {
        window.webkit.messageHandlers.healthKit.postMessage({
          action: 'requestAuthorization',
          types: ['heartRate', 'restingHeartRate', 'heartRateVariability']
        });
        
        // Listen for response
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'healthKitAuth') {
            window.removeEventListener('message', handleMessage);
            if (event.data.success) {
              resolve(event.data);
            } else {
              reject(new Error(event.data.error));
            }
          }
        };
        window.addEventListener('message', handleMessage);
      });

      // Save device connection
      await supabase.from('wearable_devices').upsert({
        user_id: profile?.id,
        name: 'Apple Watch',
        type: 'apple_watch',
        is_connected: true,
        last_sync: new Date().toISOString(),
        capabilities: [
          { type: 'heart_rate', realTime: true, accuracy: 'high' },
          { type: 'hrv', realTime: false, accuracy: 'high' },
          { type: 'calories', realTime: true, accuracy: 'medium' }
        ]
      });

      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect Apple Watch');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectFitbit = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Fitbit OAuth flow
      const clientId = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/fitbit');
      const scope = 'heartrate activity';
      
      const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      // Open popup for OAuth
      const popup = window.open(authUrl, 'fitbit-auth', 'width=500,height=600');
      
      const authResult = await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'fitbit-auth') {
            popup?.close();
            window.removeEventListener('message', handleMessage);
            
            if (event.data.success) {
              resolve(event.data);
            } else {
              reject(new Error(event.data.error));
            }
          }
        };
        
        window.addEventListener('message', handleMessage);
      });

      // Save device connection
      await supabase.from('wearable_devices').upsert({
        user_id: profile?.id,
        name: 'Fitbit Device',
        type: 'fitbit',
        is_connected: true,
        last_sync: new Date().toISOString(),
        capabilities: [
          { type: 'heart_rate', realTime: true, accuracy: 'high' },
          { type: 'calories', realTime: true, accuracy: 'high' },
          { type: 'steps', realTime: true, accuracy: 'high' }
        ]
      });

      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect Fitbit');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const connectGenericBluetooth = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      if (!navigator.bluetooth) {
        throw new Error('Bluetooth not supported on this device');
      }

      // Request Bluetooth device (heart rate service)
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      // Set up real-time data streaming
      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const heartRate = value.getUint16(1, true);
        
        setCurrentHeartRate(heartRate);
        setLastDataUpdate(new Date());
      });

      deviceConnectionRef.current = { device, server, service, characteristic };

      // Save device connection
      await supabase.from('wearable_devices').upsert({
        user_id: profile?.id,
        name: device.name || 'Bluetooth Heart Rate Monitor',
        type: 'polar', // Default to Polar for generic Bluetooth
        is_connected: true,
        last_sync: new Date().toISOString(),
        capabilities: [
          { type: 'heart_rate', realTime: true, accuracy: 'high' }
        ]
      });

      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect Bluetooth device');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Main connection dispatcher
  const connectDevice = async (deviceType: WearableDevice['type']): Promise<void> => {
    switch (deviceType) {
      case 'apple_watch':
        return connectAppleWatch();
      case 'fitbit':
        return connectFitbit();
      case 'polar':
      case 'garmin':
        return connectGenericBluetooth();
      default:
        throw new Error(`Device type ${deviceType} not yet supported`);
    }
  };

  // Disconnect device
  const disconnectDevice = async (deviceId: string): Promise<void> => {
    try {
      await supabase
        .from('wearable_devices')
        .update({ is_connected: false })
        .eq('id', deviceId);

      // Clean up active connections
      if (deviceConnectionRef.current) {
        await deviceConnectionRef.current.server?.disconnect();
        deviceConnectionRef.current = null;
      }

      queryClient.invalidateQueries({ queryKey: ['wearable-devices'] });
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  // Start real-time monitoring
  const startRealTimeMonitoring = async (): Promise<void> => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Initialize metrics
    setRealTimeMetrics({
      heartRate: 0,
      heartRateReserve: 0,
      timeInZones: {
        zone1: 0,
        zone2: 0,
        zone3: 0,
        zone4: 0,
        zone5: 0,
      },
      averageHR: 0,
      calories: 0,
      strain: 0,
    });

    // Set up WebSocket connection for real-time data
    const wsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('http', 'ws')}/realtime/v1`;
    webSocketRef.current = new WebSocket(wsUrl);
    
    // Start monitoring interval
    monitoringIntervalRef.current = setInterval(() => {
      updateRealTimeMetrics();
    }, 1000); // Update every second
  };

  // Stop real-time monitoring
  const stopRealTimeMonitoring = (): void => {
    setIsMonitoring(false);
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
  };

  // Update real-time metrics
  const updateRealTimeMetrics = useCallback(() => {
    if (!currentHeartRate || !biometricProfile) return;

    const zones = calculateHeartRateZones(currentHeartRate, biometricProfile);
    const currentZone = zones.zone;

    setRealTimeMetrics(prev => {
      if (!prev) return null;

      const newTimeInZones = { ...prev.timeInZones };
      newTimeInZones[currentZone] += 1; // Add 1 second to current zone

      const totalTime = Object.values(newTimeInZones).reduce((sum, time) => sum + time, 0);
      const weightedHR = Object.entries(newTimeInZones).reduce((sum, [zone, time]) => {
        const zoneWeight = zone === 'zone5' ? 5 : zone === 'zone4' ? 4 : zone === 'zone3' ? 3 : zone === 'zone2' ? 2 : 1;
        return sum + (time * zoneWeight);
      }, 0);

      return {
        ...prev,
        heartRate: currentHeartRate,
        heartRateReserve: zones.heartRateReserve,
        timeInZones: newTimeInZones,
        averageHR: totalTime > 0 ? Math.round(weightedHR / totalTime * 20 + biometricProfile.restingHeartRate) : currentHeartRate,
        // Strain calculation will be handled by the enhanced strain algorithm
      };
    });
  }, [currentHeartRate, biometricProfile, calculateHeartRateZones]);

  // Update biometric profile
  const updateBiometricProfileMutation = useMutation({
    mutationFn: async (updates: Partial<BiometricProfile>) => {
      const { data, error } = await supabase
        .from('biometric_profiles')
        .upsert({
          user_id: profile?.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-profile'] });
    },
  });

  const updateBiometricProfile = (updates: Partial<BiometricProfile>) => 
    updateBiometricProfileMutation.mutateAsync(updates);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRealTimeMonitoring();
      if (deviceConnectionRef.current) {
        deviceConnectionRef.current.server?.disconnect();
      }
    };
  }, []);

  return {
    connectedDevices,
    isConnecting,
    connectionError,
    currentHeartRate,
    realTimeMetrics,
    biometricProfile,
    connectDevice,
    disconnectDevice,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    updateBiometricProfile,
    isMonitoring,
    lastDataUpdate,
  };
};