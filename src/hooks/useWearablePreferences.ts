/**
 * Hook for managing user wearable device preferences
 * 
 * Allows users to choose which wearable device they want to use
 * for calorie tracking instead of automatic priority system.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type WearableDevice = 'whoop' | 'healthkit' | 'google_fit' | 'manual';

interface WearableDeviceInfo {
  id: WearableDevice;
  name: string;
  description: string;
  platform: 'iOS' | 'Android' | 'Web' | 'All';
  isAvailable: boolean;
  isConnected: boolean;
  lastSync?: string;
}

interface UseWearablePreferencesReturn {
  selectedDevice: WearableDevice;
  availableDevices: WearableDeviceInfo[];
  isLoading: boolean;
  error: string | null;
  setPreferredDevice: (device: WearableDevice) => Promise<boolean>;
  connectDevice: (device: WearableDevice) => Promise<boolean>;
  disconnectDevice: (device: WearableDevice) => Promise<boolean>;
}

export const useWearablePreferences = (): UseWearablePreferencesReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get user's current preference
  const { data: preference, isLoading: preferenceLoading } = useQuery({
    queryKey: ['wearable-preference', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_wearable_preferences')
        .select('preferred_device')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.preferred_device || 'manual';
    },
    enabled: !!user?.id,
  });

  // Check connection status for each device
  const { data: connectionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['wearable-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const [whoopRes, healthkitRes, googleFitRes] = await Promise.allSettled([
        // Check WHOOP connection
        supabase
          .from('whoop_tokens')
          .select('expires_at')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString())
          .single(),

        // Check HealthKit connection (recent data = connected)
        supabase
          .from('healthkit_daily_activity')
          .select('synced_at')
          .eq('user_id', user.id)
          .gte('activity_date', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('synced_at', { ascending: false })
          .limit(1)
          .single(),

        // Check Google Fit connection
        supabase
          .from('google_fit_connections')
          .select('expires_at, last_sync_at')
          .eq('user_id', user.id)
          .gt('expires_at', new Date().toISOString())
          .single(),
      ]);

      return {
        whoop: whoopRes.status === 'fulfilled' && whoopRes.value.data,
        healthkit: healthkitRes.status === 'fulfilled' && healthkitRes.value.data,
        google_fit: googleFitRes.status === 'fulfilled' && googleFitRes.value.data,
      };
    },
    enabled: !!user?.id,
  });

  // Determine platform availability
  const getPlatformAvailability = () => {
    if (typeof window === 'undefined') return { isIOS: false, isAndroid: false, isWeb: false };
    
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isWeb = !isIOS && !isAndroid;

    return { isIOS, isAndroid, isWeb };
  };

  const { isIOS, isAndroid, isWeb } = getPlatformAvailability();

  // Define available devices based on platform and connection status
  const availableDevices: WearableDeviceInfo[] = [
    {
      id: 'whoop',
      name: 'WHOOP',
      description: 'Professional strain & recovery tracking',
      platform: 'All',
      isAvailable: true,
      isConnected: !!connectionStatus?.whoop,
      lastSync: connectionStatus?.whoop?.expires_at,
    },
    {
      id: 'healthkit',
      name: 'Apple Watch',
      description: 'Activity rings & workout tracking',
      platform: 'iOS',
      isAvailable: isIOS,
      isConnected: !!connectionStatus?.healthkit,
      lastSync: connectionStatus?.healthkit?.synced_at,
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      description: 'Android fitness & activity tracking',
      platform: 'Android',
      isAvailable: isAndroid || isWeb, // Available on Android and Web
      isConnected: !!connectionStatus?.google_fit,
      lastSync: connectionStatus?.google_fit?.last_sync_at,
    },
    {
      id: 'manual',
      name: 'Manual Entry',
      description: 'Manual calorie calculation based on BMR',
      platform: 'All',
      isAvailable: true,
      isConnected: true, // Always "connected"
    },
  ];

  // Mutation to update preferred device
  const setPreferenceMutation = useMutation({
    mutationFn: async (device: WearableDevice) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_wearable_preferences')
        .upsert({
          user_id: user.id,
          preferred_device: device,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return device;
    },
    onSuccess: (device) => {
      queryClient.invalidateQueries(['wearable-preference', user?.id]);
      queryClient.invalidateQueries(['unified-calories', user?.id]);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update device preference');
    },
  });

  const setPreferredDevice = async (device: WearableDevice): Promise<boolean> => {
    try {
      await setPreferenceMutation.mutateAsync(device);
      return true;
    } catch (error) {
      console.error('Error setting preferred device:', error);
      return false;
    }
  };

  const connectDevice = async (device: WearableDevice): Promise<boolean> => {
    try {
      setError(null);

      switch (device) {
        case 'whoop':
          // Redirect to WHOOP OAuth
          window.open('/calendar?connect_whoop=true', '_blank');
          return true;

        case 'healthkit':
          // Show HealthKit instructions
          alert('To connect Apple Watch:\n\n1. Open the iOS app\n2. Go to Health integration\n3. Grant HealthKit permissions');
          return true;

        case 'google_fit':
          // Trigger Google Fit OAuth
          const { data, error } = await supabase.functions.invoke('google-fit-oauth', {
            body: { user_id: user?.id }
          });

          if (error) throw error;

          if (isWeb && typeof window !== 'undefined') {
            // Open OAuth popup for web
            const popup = window.open(
              data.authUrl,
              'google_fit_auth',
              'width=500,height=600,scrollbars=yes,resizable=yes'
            );

            return new Promise((resolve) => {
              const messageHandler = (event: MessageEvent) => {
                if (event.data.type === 'google_fit_auth') {
                  window.removeEventListener('message', messageHandler);
                  popup?.close();
                  if (event.data.success) {
                    queryClient.invalidateQueries(['wearable-connections', user?.id]);
                  }
                  resolve(event.data.success);
                }
              };

              window.addEventListener('message', messageHandler);

              // Fallback: check if popup was closed manually
              const checkClosed = setInterval(() => {
                if (popup?.closed) {
                  clearInterval(checkClosed);
                  window.removeEventListener('message', messageHandler);
                  resolve(false);
                }
              }, 1000);
            });
          } else {
            // For mobile, open in external browser
            window.open(data.authUrl, '_blank');
            return true;
          }

        case 'manual':
          // No connection needed for manual
          return true;

        default:
          throw new Error(`Unsupported device: ${device}`);
      }
    } catch (error: any) {
      setError(error.message || `Failed to connect ${device}`);
      return false;
    }
  };

  const disconnectDevice = async (device: WearableDevice): Promise<boolean> => {
    try {
      setError(null);

      switch (device) {
        case 'whoop':
          // Would call WHOOP disconnect API
          return false;

        case 'healthkit':
          // HealthKit can't be programmatically disconnected
          alert('To disconnect Apple Watch:\n\n1. Go to iOS Settings\n2. Health > Data Access & Devices\n3. Remove app permissions');
          return false;

        case 'google_fit':
          const { error } = await supabase.functions.invoke('google-fit-oauth', {
            body: {
              action: 'disconnect',
              user_id: user?.id
            }
          });

          if (error) throw error;

          queryClient.invalidateQueries(['wearable-connections', user?.id]);
          return true;

        case 'manual':
          // Can't disconnect manual
          return true;

        default:
          return false;
      }
    } catch (error: any) {
      setError(error.message || `Failed to disconnect ${device}`);
      return false;
    }
  };

  return {
    selectedDevice: preference || 'manual',
    availableDevices,
    isLoading: preferenceLoading || statusLoading,
    error,
    setPreferredDevice,
    connectDevice,
    disconnectDevice,
  };
};