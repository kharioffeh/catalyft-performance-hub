/**
 * Catalyft Fitness App - Exercise Card Component
 * Display exercise information with interactive features
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';
import Card from './Card';
import ProgressRing from './ProgressRing';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface ExerciseSet {
  reps: number;
  weight?: number;
  completed?: boolean;
}

export interface ExerciseData {
  id: string;
  name: string;
  category: string;
  muscle: string;
  equipment?: string;
  image?: string;
  sets?: ExerciseSet[];
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  restTime?: number; // in seconds
  notes?: string;
  videoUrl?: string;
}

export interface ExerciseCardProps {
  exercise: ExerciseData;
  onPress?: (exercise: ExerciseData) => void;
  onStartExercise?: (exercise: ExerciseData) => void;
  onCompleteSet?: (exerciseId: string, setIndex: number) => void;
  showProgress?: boolean;
  showDetails?: boolean;
  expanded?: boolean;
  style?: ViewStyle;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  onStartExercise,
  onCompleteSet,
  showProgress = true,
  showDetails = true,
  expanded: initialExpanded = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State
  const [expanded, setExpanded] = useState(initialExpanded);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  
  // Animation values
  const expandAnimation = useSharedValue(initialExpanded ? 1 : 0);
  const scaleAnimation = useSharedValue(1);
  
  // Calculate progress
  const completedSets = exercise.sets?.filter(set => set.completed).length || 0;
  const totalSets = exercise.sets?.length || exercise.targetSets || 0;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // Get muscle group color
  const getMuscleColor = (muscle: string): string => {
    const muscleColors: { [key: string]: string } = {
      chest: colors.primary,
      back: colors.secondary,
      legs: colors.success,
      shoulders: colors.warning,
      arms: colors.error,
      core: colors.success,
      cardio: colors.warning,
    };
    return muscleColors[muscle.toLowerCase()] || colors.primary;
  };
  
  // Toggle expansion
  const toggleExpanded = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    expandAnimation.value = withSpring(newExpanded ? 1 : 0, { tension: 100, friction: 8 });
    
    if (newExpanded) {
      // HapticFeedback.trigger('impactLight'); // Removed haptic feedback
    }
  }, [expanded, expandAnimation]);
  
  // Handle press
  const handlePress = useCallback(() => {
    if (onPress) {
      scaleAnimation.value = withSpring(0.95, { tension: 200, friction: 10 });
      setTimeout(() => {
        scaleAnimation.value = withSpring(1, { tension: 200, friction: 10 });
      }, 100);
      
      // HapticFeedback.trigger('impactLight'); // Removed haptic feedback
      onPress(exercise);
    } else {
      toggleExpanded();
    }
  }, [exercise, onPress, toggleExpanded, scaleAnimation]);
  
  // Handle set completion
  const handleSetComplete = useCallback((setIndex: number) => {
    // HapticFeedback.trigger('impactMedium'); // Removed haptic feedback
    onCompleteSet?.(exercise.id, setIndex);
    setSelectedSet(setIndex);
    
    // Animate the completed set
    setTimeout(() => {
      setSelectedSet(null);
    }, 500);
  }, [exercise.id, onCompleteSet]);
  
  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));
  
  const animatedDetailsStyle = useAnimatedStyle(() => {
    const height = interpolate(
      expandAnimation.value,
      [0, 1],
      [0, 200] // Adjust based on content
    );
    
    const opacity = interpolate(
      expandAnimation.value,
      [0, 1],
      [0, 1]
    );
    
    return {
      height,
      opacity,
      overflow: 'hidden',
    };
  });
  
  return (
    <Animated.View style={[animatedCardStyle, style]}>
      <Card
        variant="elevated"
        onPress={handlePress}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          {exercise.image ? (
            <Image source={{ uri: exercise.image }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
              <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                {exercise.name.charAt(0)}
              </Text>
            </View>
          )}
          
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {exercise.name}
            </Text>
            <View style={styles.tags}>
              <View style={[styles.tag, { backgroundColor: getMuscleColor(exercise.muscle) + '20' }]}>
                <Text style={[styles.tagText, { color: getMuscleColor(exercise.muscle) }]}>
                  {exercise.muscle}
                </Text>
              </View>
              {exercise.equipment && (
                <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                    {exercise.equipment}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {showProgress && totalSets > 0 && (
            <ProgressRing
              progress={progress}
              size={50}
              strokeWidth={4}
              value={`${completedSets}/${totalSets}`}
              showPercentage={false}
            />
          )}
        </View>
        
        {/* Quick stats */}
        {showDetails && !expanded && (
          <View style={styles.quickStats}>
            {exercise.targetSets && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.targetSets}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Sets
                </Text>
              </View>
            )}
            {exercise.targetReps && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.targetReps}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Reps
                </Text>
              </View>
            )}
            {exercise.targetWeight && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.targetWeight}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  kg
                </Text>
              </View>
            )}
            {exercise.restTime && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {exercise.restTime}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Rest (s)
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Expanded details */}
        <Animated.View style={animatedDetailsStyle}>
          {/* Sets */}
          {exercise.sets && exercise.sets.length > 0 && (
            <View style={styles.sets}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sets</Text>
              {exercise.sets.map((set, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.setRow,
                    set.completed && { backgroundColor: colors.success + '10' },
                    selectedSet === index && styles.selectedSet,
                  ]}
                  onPress={() => handleSetComplete(index)}
                >
                  <Text style={[styles.setNumber, { color: colors.textSecondary }]}>
                    Set {index + 1}
                  </Text>
                  <Text style={[styles.setDetails, { color: colors.text }]}>
                    {set.reps} reps {set.weight && `@ ${set.weight}kg`}
                  </Text>
                  {set.completed && (
                    <Text style={[styles.checkmark, { color: colors.success }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Notes */}
          {exercise.notes && (
            <View style={styles.notes}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                {exercise.notes}
              </Text>
            </View>
          )}
          
          {/* Action buttons */}
          <View style={styles.actions}>
            {onStartExercise && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => onStartExercise(exercise)}
              >
                <Text style={[styles.actionButtonText, { color: colors.textOnPrimary }]}>
                  Start Exercise
                </Text>
              </TouchableOpacity>
            )}
            {exercise.videoUrl && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.primary }]}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  Watch Video
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        {/* Expand indicator */}
        {showDetails && (
          <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
            <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
              {expanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
  } as ImageStyle,
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
  },
  statLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.regular,
    marginTop: theme.spacing.xs,
  },
  sets: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.sm,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedSet: {
    transform: [{ scale: 0.98 }],
  },
  setNumber: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.regular,
    width: 50,
  },
  setDetails: {
    fontSize: theme.typography.sizes.regular,
    fontWeight: theme.typography.weights.regular,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
  },
  notes: {
    marginTop: theme.spacing.md,
  },
  notesText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.regular,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.regular,
    fontWeight: theme.typography.weights.medium,
  },
  expandButton: {
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
  },
  expandIcon: {
    fontSize: 12,
  },
});

export default ExerciseCard;