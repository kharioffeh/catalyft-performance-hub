import { useState, useEffect, useCallback } from 'react';
import { useWearableData, RealTimeMetrics, BiometricProfile } from './useWearableData';

export interface ExerciseData {
  sets: number;
  reps: number;
  load_kg: number;
  rpe: number;
  completed: boolean;
  timestamp: Date;
}

export interface StrainComponents {
  cardiovascularStrain: number; // From heart rate data (0-10)
  mechanicalStrain: number; // From volume and RPE (0-10)
  overallStrain: number; // Combined strain (0-21)
  intensity: number; // Exercise intensity factor (0-1)
  duration: number; // Session duration in minutes
  efficiency: number; // Strain per unit time (0-1)
}

export interface StrainCalculationOptions {
  sessionType: 'strength' | 'conditioning' | 'recovery' | 'technical' | 'hypertrophy';
  targetStrain: number;
  sessionDuration: number; // in minutes
  fitnessLevel: BiometricProfile['fitness_level'];
}

export interface StrainZoneData {
  zone: 'recovery' | 'low' | 'moderate' | 'high' | 'very_high';
  color: string;
  description: string;
  recommendation: string;
}

export const useEnhancedStrainCalculation = (options: StrainCalculationOptions) => {
  const { realTimeMetrics, biometricProfile, isMonitoring } = useWearableData();
  
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseData[]>([]);
  const [strainComponents, setStrainComponents] = useState<StrainComponents>({
    cardiovascularStrain: 0,
    mechanicalStrain: 0,
    overallStrain: 0,
    intensity: 0,
    duration: 0,
    efficiency: 0,
  });

  // Strain zone definitions
  const getStrainZone = useCallback((strain: number): StrainZoneData => {
    if (strain <= 6) {
      return {
        zone: 'recovery',
        color: '#22c55e',
        description: 'Active recovery zone',
        recommendation: 'Light movement, mobility work, or rest'
      };
    } else if (strain <= 10) {
      return {
        zone: 'low',
        color: '#3b82f6',
        description: 'Low intensity training',
        recommendation: 'Build aerobic base, technique work'
      };
    } else if (strain <= 14) {
      return {
        zone: 'moderate',
        color: '#f59e0b',
        description: 'Moderate training stimulus',
        recommendation: 'Balanced training, good for adaptation'
      };
    } else if (strain <= 18) {
      return {
        zone: 'high',
        color: '#f97316',
        description: 'High intensity training',
        recommendation: 'Quality over quantity, ensure adequate recovery'
      };
    } else {
      return {
        zone: 'very_high',
        color: '#ef4444',
        description: 'Very high strain',
        recommendation: 'Peak effort, extended recovery needed'
      };
    }
  }, []);

  // Calculate cardiovascular strain from heart rate data
  const calculateCardiovascularStrain = useCallback((
    metrics: RealTimeMetrics,
    profile: BiometricProfile,
    sessionDuration: number
  ): number => {
    if (!metrics || !profile) return 0;

    const { timeInZones, averageHR, heartRateReserve } = metrics;
    const totalTime = Object.values(timeInZones).reduce((sum, time) => sum + time, 0);
    
    if (totalTime === 0) return 0;

    // TRIMP (Training Impulse) calculation with zone weighting
    let trimp = 0;
    const zoneMultipliers = {
      zone1: 1,   // 50-60% HRR
      zone2: 2,   // 60-70% HRR  
      zone3: 3,   // 70-80% HRR
      zone4: 4,   // 80-90% HRR
      zone5: 5,   // 90-100% HRR
    };

    Object.entries(timeInZones).forEach(([zone, time]) => {
      const multiplier = zoneMultipliers[zone as keyof typeof zoneMultipliers];
      const relativeTime = time / totalTime;
      trimp += relativeTime * multiplier;
    });

    // Adjust for fitness level
    const fitnessMultiplier = {
      beginner: 1.3,
      intermediate: 1.0,
      advanced: 0.8,
      elite: 0.6
    }[profile.fitness_level];

    // Convert TRIMP to 0-10 scale
    const rawStrain = (trimp * sessionDuration * fitnessMultiplier) / 60; // Per hour
    return Math.min(10, Math.max(0, rawStrain));
  }, []);

  // Calculate mechanical strain from exercise volume and RPE
  const calculateMechanicalStrain = useCallback((
    exercises: ExerciseData[],
    sessionType: string,
    fitnessLevel: BiometricProfile['fitness_level']
  ): number => {
    if (exercises.length === 0) return 0;

    let totalVolume = 0;
    let totalSets = 0;
    let weightedRPE = 0;

    exercises.forEach(exercise => {
      if (exercise.completed) {
        const volume = exercise.sets * exercise.reps * exercise.load_kg;
        totalVolume += volume;
        totalSets += exercise.sets;
        weightedRPE += exercise.rpe * exercise.sets;
      }
    });

    if (totalSets === 0) return 0;

    const averageRPE = weightedRPE / totalSets;
    
    // Session type multipliers
    const sessionMultipliers = {
      strength: 1.2,     // Higher mechanical stress
      hypertrophy: 1.1,  // High volume
      conditioning: 0.7, // Lower mechanical stress
      technical: 0.5,    // Very low mechanical stress
      recovery: 0.3      // Minimal mechanical stress
    };

    const sessionMultiplier = sessionMultipliers[sessionType as keyof typeof sessionMultipliers] || 1.0;

    // Fitness level adjustment (more fit = can handle more volume)
    const fitnessMultiplier = {
      beginner: 1.4,
      intermediate: 1.0,
      advanced: 0.7,
      elite: 0.5
    }[fitnessLevel];

    // Volume-based strain (logarithmic scale to prevent extreme values)
    const volumeStrain = Math.log10(totalVolume + 1) * 0.8;
    
    // RPE-based strain
    const rpeStrain = (averageRPE / 10) * 4; // Scale RPE to 0-4 range
    
    const rawStrain = (volumeStrain + rpeStrain) * sessionMultiplier * fitnessMultiplier;
    return Math.min(10, Math.max(0, rawStrain));
  }, []);

  // Main strain calculation that combines cardiovascular and mechanical components
  const calculateOverallStrain = useCallback(() => {
    if (!biometricProfile) return;

    const cardiovascularStrain = realTimeMetrics 
      ? calculateCardiovascularStrain(realTimeMetrics, biometricProfile, options.sessionDuration)
      : 0;

    const mechanicalStrain = calculateMechanicalStrain(
      exerciseHistory,
      options.sessionType,
      options.fitnessLevel
    );

    // Weight the components based on session type
    let cvWeight = 0.5; // Default 50/50 split
    let mechanicalWeight = 0.5;

    switch (options.sessionType) {
      case 'conditioning':
        cvWeight = 0.7;      // 70% cardiovascular
        mechanicalWeight = 0.3; // 30% mechanical
        break;
      case 'strength':
        cvWeight = 0.3;      // 30% cardiovascular
        mechanicalWeight = 0.7; // 70% mechanical
        break;
      case 'hypertrophy':
        cvWeight = 0.4;      // 40% cardiovascular
        mechanicalWeight = 0.6; // 60% mechanical
        break;
      case 'recovery':
        cvWeight = 0.8;      // 80% cardiovascular (heart rate variability important)
        mechanicalWeight = 0.2; // 20% mechanical
        break;
      case 'technical':
        cvWeight = 0.2;      // 20% cardiovascular
        mechanicalWeight = 0.8; // 80% mechanical (skill development)
        break;
    }

    // Calculate weighted overall strain (0-21 scale to match Whoop/industry standard)
    const weightedStrain = (cardiovascularStrain * cvWeight + mechanicalStrain * mechanicalWeight);
    const overallStrain = Math.min(21, weightedStrain * 2.1); // Scale to 0-21

    // Calculate intensity and efficiency metrics
    const intensity = overallStrain / 21; // 0-1 scale
    const efficiency = options.sessionDuration > 0 ? overallStrain / options.sessionDuration : 0;

    setStrainComponents({
      cardiovascularStrain,
      mechanicalStrain,
      overallStrain,
      intensity,
      duration: options.sessionDuration,
      efficiency
    });
  }, [
    realTimeMetrics,
    biometricProfile,
    exerciseHistory,
    options,
    calculateCardiovascularStrain,
    calculateMechanicalStrain
  ]);

  // Add exercise data
  const addExerciseData = useCallback((exercise: ExerciseData) => {
    setExerciseHistory(prev => [...prev, exercise]);
  }, []);

  // Update exercise data
  const updateExerciseData = useCallback((index: number, updates: Partial<ExerciseData>) => {
    setExerciseHistory(prev => 
      prev.map((exercise, i) => 
        i === index ? { ...exercise, ...updates } : exercise
      )
    );
  }, []);

  // Reset exercise history (for new session)
  const resetExerciseHistory = useCallback(() => {
    setExerciseHistory([]);
  }, []);

  // Get strain prediction based on current trajectory
  const getStrainPrediction = useCallback((remainingExercises: number): number => {
    if (exerciseHistory.length === 0) return strainComponents.overallStrain;

    // Calculate average strain per exercise so far
    const currentStrainPerExercise = strainComponents.overallStrain / Math.max(1, exerciseHistory.length);
    
    // Predict final strain
    const predictedStrain = strainComponents.overallStrain + (currentStrainPerExercise * remainingExercises);
    
    return Math.min(21, predictedStrain);
  }, [strainComponents.overallStrain, exerciseHistory.length]);

  // Get recommendations based on current strain
  const getStrainRecommendations = useCallback((): string[] => {
    const currentStrain = strainComponents.overallStrain;
    const targetStrain = options.targetStrain;
    const difference = currentStrain - targetStrain;
    const zone = getStrainZone(currentStrain);

    const recommendations: string[] = [];

    // Zone-based recommendations
    recommendations.push(zone.recommendation);

    // Target-based recommendations
    if (difference > 3) {
      recommendations.push('Consider reducing intensity or volume to hit target zone');
      recommendations.push('Focus on form and controlled movements');
    } else if (difference < -3) {
      recommendations.push('Room to increase intensity to reach optimal strain');
      recommendations.push('Consider adding sets or increasing load');
    } else {
      recommendations.push('Great! You\'re in the optimal strain zone for this session');
    }

    // Heart rate based recommendations
    if (realTimeMetrics) {
      if (realTimeMetrics.heartRateReserve > 90) {
        recommendations.push('Heart rate very high - consider longer rest periods');
      } else if (realTimeMetrics.heartRateReserve < 50 && options.sessionType === 'conditioning') {
        recommendations.push('Heart rate low for conditioning - increase pace or intensity');
      }
    }

    return recommendations;
  }, [strainComponents.overallStrain, options.targetStrain, getStrainZone, realTimeMetrics, options.sessionType]);

  // Recalculate strain when inputs change
  useEffect(() => {
    calculateOverallStrain();
  }, [calculateOverallStrain]);

  return {
    // Current strain data
    strainComponents,
    strainZone: getStrainZone(strainComponents.overallStrain),
    
    // Exercise tracking
    exerciseHistory,
    addExerciseData,
    updateExerciseData,
    resetExerciseHistory,
    
    // Predictions and recommendations
    getStrainPrediction,
    getStrainRecommendations: getStrainRecommendations(),
    
    // Real-time metrics from wearables
    realTimeMetrics,
    isMonitoring,
    
    // Utilities
    getStrainZone,
  };
};