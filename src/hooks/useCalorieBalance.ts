import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedWearableData } from './useUnifiedWearableData';
import { useNutrition } from './useNutrition';
import { generateDemoCalorieData, getDemoTodaysData } from '@/utils/demoCalorieData';

interface DailyCalorieData {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  bmr: number; // Basal Metabolic Rate
  totalExpenditure: number; // BMR + Activity calories
  balance: number; // Consumed - Expenditure (negative = deficit, positive = surplus)
  balancePercentage: number; // Balance as percentage of expenditure
  dataSource?: 'whoop' | 'healthkit' | 'estimated' | 'none';
}

interface CalorieBalanceReturn {
  todaysData: DailyCalorieData | null;
  weeklyData: DailyCalorieData[];
  monthlyData: DailyCalorieData[];
  isLoading: boolean;
  error: string | null;
  bmr: number;
  estimatedTDEE: number;
}

export const useCalorieBalance = (): CalorieBalanceReturn => {
  const { profile } = useAuth();
  const { getTodaysMacros } = useNutrition();
  const { dailyCalories, todaysData: unifiedTodaysData, connectionStatus, isLoading: wearableLoading } = useUnifiedWearableData(30);
  const [error, setError] = useState<string | null>(null);

  // Get user profile data for BMR calculation
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('age, gender, weight, height, activity_level')
        .eq('id', profile.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Calculate BMR using Mifflin-St Jeor equation
  const bmr = useMemo(() => {
    if (!userProfile?.weight || !userProfile?.height || !userProfile?.age || !userProfile?.gender) {
      return 0;
    }

    const { weight, height, age, gender } = userProfile;
    
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  }, [userProfile]);

  // Estimate TDEE (Total Daily Energy Expenditure)
  const estimatedTDEE = useMemo(() => {
    if (!bmr || !userProfile?.activity_level) return bmr;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    return bmr * (activityMultipliers[userProfile.activity_level as keyof typeof activityMultipliers] || 1.2);
  }, [bmr, userProfile?.activity_level]);

  // Get daily metrics including steps and activity data
  const { data: dailyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['daily-metrics', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('metrics')
        .select('date, steps, strain, hr_rest')
        .eq('user_id', profile.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Simplified - we now use the unified wearable data hook
  // The complex WHOOP/HealthKit logic is handled in useUnifiedWearableData

  // Get nutrition data for the same period
  const { data: nutritionData, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutrition-data', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('date, calories')
        .eq('user_id', profile.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Calculate calories burned from activity (if no wearable data)
  const calculateActivityCalories = useCallback((steps: number, strain?: number) => {
    if (!userProfile?.weight) return 0;
    
    // Rough estimation: 0.04 calories per step per kg of body weight
    const stepCalories = (steps * 0.04 * userProfile.weight) / 1000;
    
    // Additional calories from strain/intensity
    const strainCalories = strain ? (strain * 10) : 0;
    
    return Math.round(stepCalories + strainCalories);
  }, [userProfile?.weight]);

  // Process and combine data using unified wearable data
  const processedData = useMemo(() => {
    if (!nutritionData) return [];

    const dataMap = new Map<string, DailyCalorieData>();

    // Initialize with BMR for each day
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dataMap.set(dateStr, {
        date: dateStr,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        bmr,
        totalExpenditure: bmr,
        balance: -bmr,
        balancePercentage: -100,
        dataSource: 'none',
      });
    }

    // Add nutrition data
    nutritionData.forEach(entry => {
      const existing = dataMap.get(entry.date);
      if (existing) {
        existing.caloriesConsumed += entry.calories || 0;
      }
    });

    // Add unified wearable calorie data
    dailyCalories.forEach(wearableDay => {
      const existing = dataMap.get(wearableDay.date);
      if (existing) {
        existing.caloriesBurned = wearableDay.caloriesBurned;
        existing.dataSource = wearableDay.dataSource;
        existing.totalExpenditure = existing.bmr + existing.caloriesBurned;
        existing.balance = existing.caloriesConsumed - existing.totalExpenditure;
        existing.balancePercentage = existing.totalExpenditure > 0 
          ? (existing.balance / existing.totalExpenditure) * 100 
          : 0;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [nutritionData, dailyCalories, bmr]);

  // Get today's calories consumed from current nutrition hook
  const todaysMacros = getTodaysMacros();
  const todaysCaloriesConsumed = todaysMacros.calories;

  // Create today's data with real-time consumption
  const todaysData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const baseData = processedData.find(d => d.date === today);
    
    if (!baseData) return null;

    const updatedData = {
      ...baseData,
      caloriesConsumed: todaysCaloriesConsumed,
      balance: todaysCaloriesConsumed - baseData.totalExpenditure,
    };
    
    updatedData.balancePercentage = updatedData.totalExpenditure > 0 
      ? (updatedData.balance / updatedData.totalExpenditure) * 100 
      : 0;

    return updatedData;
  }, [processedData, todaysCaloriesConsumed]);

  // Split data into periods
  const weeklyData = processedData.slice(0, 7);
  const monthlyData = processedData;

  const isLoading = metricsLoading || nutritionLoading || wearableLoading;

  // Fallback to demo data if no real data is available (for testing/demo purposes)
  const shouldUseDemoData = !isLoading && (!processedData.length || !userProfile);
  
  let finalTodaysData = todaysData;
  let finalWeeklyData = weeklyData;
  let finalMonthlyData = monthlyData;
  
  if (shouldUseDemoData) {
    const demoData = generateDemoCalorieData(30);
    const demoTodaysData = getDemoTodaysData();
    
    // Update demo today's data with actual consumed calories if available
    if (todaysCaloriesConsumed > 0) {
      demoTodaysData.caloriesConsumed = todaysCaloriesConsumed;
      demoTodaysData.balance = todaysCaloriesConsumed - demoTodaysData.totalExpenditure;
      demoTodaysData.balancePercentage = (demoTodaysData.balance / demoTodaysData.totalExpenditure) * 100;
    }
    
    finalTodaysData = demoTodaysData;
    finalWeeklyData = demoData.slice(0, 7);
    finalMonthlyData = demoData;
  }

  return {
    todaysData: finalTodaysData,
    weeklyData: finalWeeklyData,
    monthlyData: finalMonthlyData,
    isLoading,
    error,
    bmr: bmr || 1600, // Default BMR if not calculated
    estimatedTDEE: estimatedTDEE || 2000, // Default TDEE if not calculated
  };
};