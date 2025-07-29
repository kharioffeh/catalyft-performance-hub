import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyCalorieData {
  date: string;
  caloriesBurned: number;
  dataSource: 'whoop' | 'healthkit' | 'google_fit' | 'estimated' | 'none';

  // Detailed breakdown
  whoopCycleCalories?: number;
  whoopWorkoutCalories?: number;
  whoopTotalCalories?: number;
  healthkitActiveCalories?: number;
  healthkitWorkoutCalories?: number;
  healthkitTotalCalories?: number;
  googleFitDailyCalories?: number;
  googleFitWorkoutCalories?: number;
  googleFitTotalCalories?: number;

  // Additional metrics (when available)
  strain?: number; // WHOOP
  activityRingProgress?: {
    movePercentage: number;
    exercisePercentage: number;
    standPercentage: number;
  }; // HealthKit
  googleFitMetrics?: {
    steps: number;
    distanceMeters: number;
    activeMinutes: number;
  }; // Google Fit
  heartRateData?: {
    resting?: number;
    average?: number;
    max?: number;
    hrv?: number;
  };
}

interface WearableConnectionStatus {
  hasWhoop: boolean;
  hasHealthKit: boolean;
  hasGoogleFit: boolean;
  primarySource: 'whoop' | 'healthkit' | 'google_fit' | 'none';
  lastSyncWhoop?: string;
  lastSyncHealthKit?: string;
  lastSyncGoogleFit?: string;
}

interface UnifiedWearableDataReturn {
  dailyCalories: DailyCalorieData[];
  todaysData: DailyCalorieData | null;
  connectionStatus: WearableConnectionStatus;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useUnifiedWearableData = (days: number = 30): UnifiedWearableDataReturn => {
  const { profile } = useAuth();

  // Query the unified view for calorie data
  const { 
    data: calorieData, 
    isLoading: caloriesLoading, 
    error: caloriesError,
    refetch: refetchCalories
  } = useQuery({
    queryKey: ['unified-calories', profile?.id, days],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('user_daily_calories')
        .select('*')
        .eq('user_id', profile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching unified calorie data:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Check WHOOP connection status
  const { data: whoopStatus } = useQuery({
    queryKey: ['whoop-status', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('whoop_tokens')
        .select('expires_at')
        .eq('user_id', profile.id)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Check HealthKit connection status (recent data = connected)
  const { data: healthkitStatus } = useQuery({
    queryKey: ['healthkit-status', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase
        .from('healthkit_daily_activity')
        .select('sync_timestamp')
        .eq('user_id', profile.id)
        .gte('activity_date', threeDaysAgo.toISOString().split('T')[0])
        .order('sync_timestamp', { ascending: false })
        .limit(1)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Check Google Fit connection status
  const { data: googleFitStatus } = useQuery({
    queryKey: ['google-fit-status', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('google_fit_connections')
        .select('expires_at, last_sync_at')
        .eq('user_id', profile.id)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Transform the raw data into our format
  const processedData: DailyCalorieData[] = (calorieData || []).map(row => {
    const hasWhoopData = row.whoop_total_calories > 0;
    const hasHealthKitData = row.healthkit_total_calories > 0;
    const hasGoogleFitData = row.google_fit_total_calories > 0;
    
    let dataSource: DailyCalorieData['dataSource'] = 'none';
    let caloriesBurned = 0;
    
    // Priority: WHOOP > HealthKit > Google Fit > Estimated
    if (hasWhoopData) {
      dataSource = 'whoop';
      caloriesBurned = row.whoop_total_calories;
    } else if (hasHealthKitData) {
      dataSource = 'healthkit';
      caloriesBurned = row.healthkit_total_calories;
    } else if (hasGoogleFitData) {
      dataSource = 'google_fit';
      caloriesBurned = row.google_fit_total_calories;
    } else if (row.final_calories_burned > 0) {
      dataSource = 'estimated';
      caloriesBurned = row.final_calories_burned;
    }

    const dailyData: DailyCalorieData = {
      date: row.date,
      caloriesBurned,
      dataSource,
      whoopCycleCalories: row.whoop_cycle_calories,
      whoopWorkoutCalories: row.whoop_workout_calories,
      whoopTotalCalories: row.whoop_total_calories,
      healthkitActiveCalories: row.healthkit_active_calories,
      healthkitWorkoutCalories: row.healthkit_workout_calories,
      healthkitTotalCalories: row.healthkit_total_calories,
      googleFitDailyCalories: row.google_fit_daily_calories,
      googleFitWorkoutCalories: row.google_fit_workout_calories,
      googleFitTotalCalories: row.google_fit_total_calories,
    };

    // Add Google Fit specific metrics if this is Google Fit data
    if (dataSource === 'google_fit') {
      dailyData.googleFitMetrics = {
        steps: row.google_fit_steps || 0,
        distanceMeters: row.google_fit_distance_meters || 0,
        activeMinutes: row.google_fit_active_minutes || 0,
      };
    }

    return dailyData;
  });

  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todaysData = processedData.find(data => data.date === today) || null;

  // Determine connection status
  const hasWhoop = !!whoopStatus;
  const hasHealthKit = !!healthkitStatus;
  const hasGoogleFit = !!googleFitStatus;
  
  let primarySource: WearableConnectionStatus['primarySource'] = 'none';
  if (hasWhoop) {
    primarySource = 'whoop';
  } else if (hasHealthKit) {
    primarySource = 'healthkit';
  } else if (hasGoogleFit) {
    primarySource = 'google_fit';
  }

  const connectionStatus: WearableConnectionStatus = {
    hasWhoop,
    hasHealthKit,
    hasGoogleFit,
    primarySource,
    lastSyncWhoop: whoopStatus?.expires_at,
    lastSyncHealthKit: healthkitStatus?.sync_timestamp,
    lastSyncGoogleFit: googleFitStatus?.last_sync_at,
  };

  return {
    dailyCalories: processedData,
    todaysData,
    connectionStatus,
    isLoading: caloriesLoading,
    error: caloriesError?.message || null,
    refreshData: refetchCalories,
  };
};