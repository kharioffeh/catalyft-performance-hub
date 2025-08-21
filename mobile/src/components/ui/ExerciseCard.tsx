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
import HapticFeedback from 'react-native-haptic-feedback';
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
      core: colors.protein,
      cardio: colors.heartRate,
    };
    return muscleColors[muscle.toLowerCase()] || colors.primary;
  };
  
  // Toggle expansion
  const toggleExpanded = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    expandAnimation.value = withSpring(newExpanded ? 1 : 0, theme.animation.spring.standard);
    
    if (newExpanded) {
      HapticFeedback.trigger('impactLight');
    }
  }, [expanded, expandAnimation]);
  
  // Handle press
  const handlePress = useCallback(() => {
    if (onPress) {
      scaleAnimation.value = withSpring(0.95, theme.animation.spring.snappy);
      setTimeout(() => {
        scaleAnimation.value = withSpring(1, theme.animation.spring.snappy);
      }, 100);
      
      HapticFeedback.trigger('impactLight');
      onPress(exercise);
    } else {
      toggleExpanded();
    }
  }, [exercise, onPress, toggleExpanded, scaleAnimation]);
  
  // Handle set completion
  const handleSetComplete = useCallback((setIndex: number) => {
    HapticFeedback.trigger('impactMedium');
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
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
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
                <View style={[styles.tag, { backgroundColor: colors.surfaceSecondary }]}>
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
    padding: theme.spacing.s4,
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
    marginLeft: theme.spacing.s3,
  },
  name: {
    ...theme.typography.styles.h5,
    marginBottom: theme.spacing.s1,
  },
  tags: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
  },
  tag: {
    paddingHorizontal: theme.spacing.s2,
    paddingVertical: theme.spacing.s1,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    ...theme.typography.styles.caption,
    fontWeight: theme.typography.weights.medium,
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.s4,
    paddingTop: theme.spacing.s3,
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.light.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.styles.h5,
  },
  statLabel: {
    ...theme.typography.styles.caption,
    marginTop: theme.spacing.s1,
  },
  sets: {
    marginTop: theme.spacing.s4,
  },
  sectionTitle: {
    ...theme.typography.styles.label,
    marginBottom: theme.spacing.s2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s3,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.s2,
  },
  selectedSet: {
    transform: [{ scale: 0.98 }],
  },
  setNumber: {
    ...theme.typography.styles.caption,
    width: 50,
  },
  setDetails: {
    ...theme.typography.styles.bodyMedium,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
  },
  notes: {
    marginTop: theme.spacing.s4,
  },
  notesText: {
    ...theme.typography.styles.bodySmall,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
    marginTop: theme.spacing.s4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.s3,
    borderRadius: theme.borderRadius.button,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: theme.borderWidth.thin,
  },
  actionButtonText: {
    ...theme.typography.styles.button,
  },
  expandButton: {
    alignItems: 'center',
    paddingTop: theme.spacing.s2,
  },
  expandIcon: {
    fontSize: 12,
  },
});

export default ExerciseCard;