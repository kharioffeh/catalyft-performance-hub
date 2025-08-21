/**
 * Catalyft Fitness App - Rep Counter Component
 * Interactive counter for tracking exercise repetitions
 */

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from '../../utils/reanimated-mock';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface RepCounterProps {
  initialCount?: number;
  targetCount?: number;
  setNumber?: number;
  totalSets?: number;
  onCountChange?: (count: number) => void;
  onSetComplete?: (setNumber: number, reps: number) => void;
  onWorkoutComplete?: () => void;
  showSetInfo?: boolean;
  enableSwipeGestures?: boolean;
  style?: ViewStyle;
}

export interface RepCounterRef {
  reset: () => void;
  setCount: (count: number) => void;
  nextSet: () => void;
}

export const RepCounter = forwardRef<RepCounterRef, RepCounterProps>(({
  initialCount = 0,
  targetCount = 10,
  setNumber = 1,
  totalSets = 3,
  onCountChange,
  onSetComplete,
  onWorkoutComplete,
  showSetInfo = true,
  enableSwipeGestures = false,
  style,
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State
  const [count, setCount] = useState(initialCount);
  const [currentSet, setCurrentSet] = useState(setNumber);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const progressScale = useSharedValue(0);
  const celebrationScale = useSharedValue(0);
  
  // Calculate progress
  const progress = targetCount > 0 ? (count / targetCount) * 100 : 0;
  const isSetComplete = count >= targetCount;
  const isWorkoutComplete = currentSet >= totalSets && isSetComplete;
  
  // Increment count
  const increment = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
    
    // Haptic feedback
    HapticFeedback.trigger('impactLight');
    
    // Animate counter
    scale.value = withSequence(
      withSpring(1.2, theme.animation.spring.bouncy),
      withSpring(1, theme.animation.spring.bouncy)
    );
    
    // Update progress
    progressScale.value = withSpring(newCount / targetCount, theme.animation.spring.standard);
    
    // Check if set is complete
    if (newCount >= targetCount) {
      HapticFeedback.trigger('notificationSuccess');
      celebrationScale.value = withSequence(
        withSpring(1.5, theme.animation.spring.bouncy),
        withSpring(0, { ...theme.animation.spring.standard, damping: 20 })
      );
      
      // Add to completed sets
      const updatedSets = [...completedSets, currentSet];
      setCompletedSets(updatedSets);
      onSetComplete?.(currentSet, newCount);
      
      // Check if workout is complete
      if (currentSet >= totalSets) {
        setTimeout(() => {
          onWorkoutComplete?.();
        }, 1000);
      }
    }
  }, [count, targetCount, currentSet, totalSets, completedSets, scale, progressScale, celebrationScale, onCountChange, onSetComplete, onWorkoutComplete]);
  
  // Decrement count
  const decrement = useCallback(() => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      onCountChange?.(newCount);
      
      // Haptic feedback
      HapticFeedback.trigger('impactLight');
      
      // Animate counter
      scale.value = withSequence(
        withSpring(0.9, theme.animation.spring.snappy),
        withSpring(1, theme.animation.spring.snappy)
      );
      
      // Update progress
      progressScale.value = withSpring(newCount / targetCount, theme.animation.spring.standard);
    }
  }, [count, targetCount, scale, progressScale, onCountChange]);
  
  // Reset counter
  const reset = useCallback(() => {
    setCount(initialCount);
    progressScale.value = withSpring(0, theme.animation.spring.standard);
    scale.value = withSequence(
      withTiming(0, { duration: 200 }),
      withSpring(1, theme.animation.spring.bouncy)
    );
    rotation.value = withSequence(
      withTiming(360, { duration: 300 }),
      withTiming(0, { duration: 0 })
    );
    
    HapticFeedback.trigger('impactMedium');
  }, [initialCount, scale, rotation, progressScale]);
  
  // Move to next set
  const nextSet = useCallback(() => {
    if (currentSet < totalSets) {
      setCurrentSet(currentSet + 1);
      setCount(0);
      progressScale.value = withSpring(0, theme.animation.spring.standard);
      
      // Animate transition
      rotation.value = withSequence(
        withTiming(180, { duration: 300 }),
        withTiming(360, { duration: 300 }),
        withTiming(0, { duration: 0 })
      );
      
      HapticFeedback.trigger('impactMedium');
    }
  }, [currentSet, totalSets, rotation, progressScale]);
  
  // Set count manually
  const setCountManual = useCallback((newCount: number) => {
    setCount(newCount);
    progressScale.value = withSpring(newCount / targetCount, theme.animation.spring.standard);
  }, [targetCount, progressScale]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    reset,
    setCount: setCountManual,
    nextSet,
  }));
  
  // Get color based on progress
  const getProgressColor = useCallback(() => {
    if (isSetComplete) return colors.success;
    if (progress >= 75) return colors.warning;
    if (progress >= 50) return colors.secondary;
    return colors.primary;
  }, [progress, isSetComplete, colors]);
  
  // Animated styles
  const animatedCounterStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  const animatedProgressStyle = useAnimatedStyle(() => ({
    height: `${progressScale.value * 100}%`,
  }));
  
  const animatedCelebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value > 0 ? 1 : 0,
  }));
  
  return (
    <View style={[styles.container, style]}>
      {/* Set info */}
      {showSetInfo && (
        <View style={styles.setInfo}>
          <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
            SET {currentSet} OF {totalSets}
          </Text>
          <View style={styles.setIndicators}>
            {Array.from({ length: totalSets }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.setIndicator,
                  {
                    backgroundColor: i < currentSet
                      ? colors.success
                      : i === currentSet - 1
                      ? isSetComplete ? colors.success : colors.primary
                      : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}
      
      {/* Main counter */}
      <View style={styles.counterContainer}>
        {/* Progress ring background */}
        <View style={[styles.progressRing, { borderColor: colors.border }]}>
          {/* Progress fill */}
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: getProgressColor() },
              animatedProgressStyle,
            ]}
          />
        </View>
        
        {/* Counter display */}
        <AnimatedTouchable
          style={[styles.counter, animatedCounterStyle]}
          onPress={increment}
          onLongPress={reset}
          activeOpacity={0.8}
        >
          <Animated.Text style={[styles.countText, { color: getProgressColor() }]}>
            {count}
          </Animated.Text>
          <Text style={[styles.targetText, { color: colors.textSecondary }]}>
            / {targetCount}
          </Text>
        </AnimatedTouchable>
        
        {/* Celebration overlay */}
        <Animated.View
          style={[styles.celebration, animatedCelebrationStyle]}
          pointerEvents="none"
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </Animated.View>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={decrement}
          disabled={count === 0}
        >
          <Text style={[styles.controlButtonText, { color: colors.text }]}>−</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={reset}
        >
          <Text style={[styles.controlButtonText, { color: colors.text }]}>↺</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={increment}
        >
          <Text style={[styles.controlButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
      
      {/* Next set button */}
      {isSetComplete && currentSet < totalSets && (
        <TouchableOpacity
          style={[styles.nextSetButton, { backgroundColor: colors.primary }]}
          onPress={nextSet}
        >
          <Text style={[styles.nextSetButtonText, { color: colors.textOnPrimary }]}>
            Next Set →
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Workout complete message */}
      {isWorkoutComplete && (
        <View style={[styles.completeMessage, { backgroundColor: colors.success }]}>
          <Text style={[styles.completeMessageText, { color: colors.textOnPrimary }]}>
            Workout Complete! 💪
          </Text>
        </View>
      )}
    </View>
  );
});

RepCounter.displayName = 'RepCounter';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.s4,
  },
  setInfo: {
    marginBottom: theme.spacing.s6,
    alignItems: 'center',
  },
  setLabel: {
    ...theme.typography.styles.overline,
    marginBottom: theme.spacing.s2,
  },
  setIndicators: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
  },
  setIndicator: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.full,
  },
  counterContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s8,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
    borderWidth: theme.borderWidth.thick,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  counter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    ...theme.typography.styles.counter,
  },
  targetText: {
    ...theme.typography.styles.h4,
  },
  celebration: {
    position: 'absolute',
  },
  celebrationEmoji: {
    fontSize: 60,
  },
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.s4,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    marginHorizontal: theme.spacing.s2,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
  },
  nextSetButton: {
    marginTop: theme.spacing.s6,
    paddingHorizontal: theme.spacing.s6,
    paddingVertical: theme.spacing.s3,
    borderRadius: theme.borderRadius.full,
  },
  nextSetButtonText: {
    ...theme.typography.styles.button,
  },
  completeMessage: {
    position: 'absolute',
    bottom: -theme.spacing.s8,
    paddingHorizontal: theme.spacing.s6,
    paddingVertical: theme.spacing.s3,
    borderRadius: theme.borderRadius.full,
  },
  completeMessageText: {
    ...theme.typography.styles.h5,
  },
});

export default RepCounter;