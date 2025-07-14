import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTargets } from '@/hooks/useTargets';
import { useNutritionDay } from '@/hooks/useNutritionDay';

export const KcalBar: React.FC = () => {
  const { kcalTarget } = useTargets();
  const { kcal } = useNutritionDay();

  // Calculate progress percentage
  const progressPercentage = kcalTarget > 0 ? (kcal / kcalTarget) * 100 : 0;
  const progressValue = useSharedValue(0);

  // Update animated value when data changes
  React.useEffect(() => {
    progressValue.value = withSpring(Math.min(progressPercentage, 100), {
      damping: 15,
      stiffness: 150,
    });
  }, [progressPercentage, progressValue]);

  // Animated styles for the progress bar
  const animatedBarStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progressValue.value,
      [0, 100, 150],
      ['hsl(var(--primary))', 'hsl(var(--primary))', '#f97316'] // blue to orange
    );

    return {
      width: `${progressValue.value}%`,
      backgroundColor,
    };
  });

  // Animated styles for overflow bar (when >100%)
  const overflowBarStyle = useAnimatedStyle(() => {
    const overflowPercentage = Math.max(0, progressPercentage - 100);
    const width = Math.min(overflowPercentage, 50); // Cap at 50% additional width
    
    return {
      width: `${width}%`,
      backgroundColor: '#f97316', // orange for overflow
      opacity: progressPercentage > 100 ? 1 : 0,
    };
  });

  const formattedPercentage = progressPercentage.toFixed(1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calories</Text>
        <Text style={styles.values}>
          {Math.round(kcal)} / {Math.round(kcalTarget)} kcal
        </Text>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          {/* Main Progress Bar */}
          <Animated.View style={[styles.progressBar, animatedBarStyle]} />
          
          {/* Overflow Bar (when >100%) */}
          {progressPercentage > 100 && (
            <Animated.View style={[styles.overflowBar, overflowBarStyle]} />
          )}
        </View>
      </View>

      {/* Percentage Display */}
      <View style={styles.footer}>
        <Text 
          style={[
            styles.percentage,
            progressPercentage > 100 && styles.overPercentage
          ]}
        >
          {formattedPercentage}%
        </Text>
        {progressPercentage > 100 && (
          <Text style={styles.overTarget}>Over target</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'hsl(var(--foreground))',
  },
  values: {
    fontSize: 14,
    color: 'hsl(var(--muted-foreground))',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'hsl(var(--muted))',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  overflowBar: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: '100%',
    top: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
    color: 'hsl(var(--foreground))',
  },
  overPercentage: {
    color: '#f97316', // orange when over target
  },
  overTarget: {
    fontSize: 12,
    color: '#f97316',
    fontWeight: '500',
  },
});