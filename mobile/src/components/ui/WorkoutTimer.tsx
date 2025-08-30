/**
 * Catalyft Fitness App - Workout Timer Component
 * Advanced timer for workout sessions with multiple modes
 */

import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
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
  withRepeat,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';
import Button from './Button';

export type TimerMode = 'countdown' | 'stopwatch' | 'interval' | 'tabata';

export interface TimerInterval {
  name: string;
  duration: number;
  type: 'work' | 'rest' | 'prepare';
}

export interface WorkoutTimerProps {
  mode?: TimerMode;
  initialTime?: number; // in seconds
  intervals?: TimerInterval[];
  autoStart?: boolean;
  showMilliseconds?: boolean;
  showControls?: boolean;
  onComplete?: () => void;
  onIntervalChange?: (interval: TimerInterval, index: number) => void;
  style?: ViewStyle;
}

export interface WorkoutTimerRef {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
}

export const WorkoutTimer = forwardRef<WorkoutTimerRef, WorkoutTimerProps>(({
  mode = 'stopwatch',
  initialTime = 0,
  intervals = [],
  autoStart = false,
  showMilliseconds = false,
  showControls = true,
  onComplete,
  onIntervalChange,
  style,
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Animation values
  const pulseAnimation = useSharedValue(1);
  const progressAnimation = useSharedValue(0);
  const colorAnimation = useSharedValue(0);
  
  // Get current interval
  const currentInterval = intervals[currentIntervalIndex];
  
  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (showMilliseconds && minutes === 0) {
      return `${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }, [showMilliseconds]);
  
  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
    
    // Start pulse animation
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // Start color animation for interval mode
    if (mode === 'interval' || mode === 'tabata') {
      colorAnimation.value = withTiming(1, { duration: 1000 });
    }
  }, [pulseAnimation, colorAnimation, mode]);
  
  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    pulseAnimation.value = withTiming(1, { duration: 300 });
  }, [pulseAnimation]);
  
  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(initialTime);
    setCurrentIntervalIndex(0);
    progressAnimation.value = withTiming(0, { duration: 300 });
    pulseAnimation.value = withTiming(1, { duration: 300 });
    colorAnimation.value = withTiming(0, { duration: 300 });
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [initialTime, progressAnimation, pulseAnimation, colorAnimation]);
  
  // Set time manually
  const setTimeManual = useCallback((seconds: number) => {
    setTime(seconds);
  }, []);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    start,
    pause,
    reset,
    setTime: setTimeManual,
  }));
  
  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          let newTime = prevTime;
          
          if (mode === 'countdown') {
            newTime = Math.max(0, prevTime - 0.01);
            
            // Update progress
            progressAnimation.value = withTiming(
              1 - (newTime / initialTime),
              { duration: 10 }
            );
            
            // Check completion
            if (newTime === 0) {
              // HapticFeedback.trigger('notificationSuccess'); // Removed
              onComplete?.();
              pause();
            }
          } else if (mode === 'stopwatch') {
            newTime = prevTime + 0.01;
          } else if ((mode === 'interval' || mode === 'tabata') && currentInterval) {
            newTime = Math.max(0, prevTime - 0.01);
            
            // Update progress
            progressAnimation.value = withTiming(
              1 - (newTime / currentInterval.duration),
              { duration: 10 }
            );
            
            // Check interval completion
            if (newTime === 0) {
              // HapticFeedback.trigger('impactMedium'); // Removed
              
              const nextIndex = currentIntervalIndex + 1;
              if (nextIndex < intervals.length) {
                setCurrentIntervalIndex(nextIndex);
                setTime(intervals[nextIndex].duration);
                onIntervalChange?.(intervals[nextIndex], nextIndex);
                
                // Animate color change
                colorAnimation.value = withTiming(
                  intervals[nextIndex].type === 'work' ? 0 : 1,
                  { duration: 500 }
                );
              } else {
                // HapticFeedback.trigger('notificationSuccess'); // Removed
                onComplete?.();
                pause();
              }
            }
          }
          
          return newTime;
        });
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, initialTime, currentInterval, currentIntervalIndex, intervals, progressAnimation, colorAnimation, pause, onComplete, onIntervalChange]);
  
  // Get timer color based on mode and state
  const getTimerColor = useCallback(() => {
    if (mode === 'interval' || mode === 'tabata') {
      if (currentInterval?.type === 'work') {
        return colors.workout;
      } else if (currentInterval?.type === 'rest') {
        return colors.rest;
      } else {
        return colors.warning;
      }
    }
    
    if (mode === 'countdown' && time < 10) {
      return colors.error;
    }
    
    return colors.primary;
  }, [mode, currentInterval, time, colors]);
  
  // Animated styles
  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));
  
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));
  
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    if (mode === 'interval' || mode === 'tabata') {
      const backgroundColor = interpolateColor(
        colorAnimation.value,
        [0, 1],
        [colors.workout, colors.rest]
      );
      return { backgroundColor };
    }
    return {};
  });
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.timerContainer, animatedBackgroundStyle]}>
        {/* Progress bar */}
        {(mode === 'countdown' || mode === 'interval' || mode === 'tabata') && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: getTimerColor() },
                animatedProgressStyle,
              ]}
            />
          </View>
        )}
        
        {/* Interval info */}
        {currentInterval && (
          <View style={styles.intervalInfo}>
            <Text style={[styles.intervalName, { color: colors.text }]}>
              {currentInterval.name}
            </Text>
            <Text style={[styles.intervalType, { color: colors.textSecondary }]}>
              {currentInterval.type.toUpperCase()} • {currentIntervalIndex + 1}/{intervals.length}
            </Text>
          </View>
        )}
        
        {/* Timer display */}
        <Animated.View style={animatedTimerStyle}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {formatTime(time)}
          </Text>
        </Animated.View>
        
        {/* Controls */}
        {showControls && (
          <View style={styles.controls}>
            {!isRunning ? (
              <>
                <Button
                  title="Start"
                  variant="primary"
                  size="large"
                  onPress={start}
                  style={styles.controlButton}
                />
                {time !== initialTime && (
                  <Button
                    title="Reset"
                    variant="outline"
                    size="large"
                    onPress={reset}
                    style={styles.controlButton}
                  />
                )}
              </>
            ) : (
              <>
                <Button
                  title="Pause"
                  variant="warning"
                  size="large"
                  onPress={pause}
                  style={styles.controlButton}
                />
                <Button
                  title="Reset"
                  variant="outline"
                  size="large"
                  onPress={reset}
                  style={styles.controlButton}
                />
              </>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
});

WorkoutTimer.displayName = 'WorkoutTimer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  timerContainer: {
    padding: theme.spacing.s6,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  intervalInfo: {
    marginBottom: theme.spacing.s4,
    alignItems: 'center',
  },
  intervalName: {
    ...theme.typography.styles.h4,
    marginBottom: theme.spacing.s1,
  },
  intervalType: {
    ...theme.typography.styles.overline,
  },
  timerText: {
    ...theme.typography.styles.timer,
  },
  controls: {
    flexDirection: 'row',
    marginTop: theme.spacing.s6,
    gap: theme.spacing.s3,
  },
  controlButton: {
    minWidth: 100,
  },
});

export default WorkoutTimer;