/**
 * Catalyft Fitness App - Progress Bar Component
 * Horizontal progress bar with gradient fill and animations
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export interface ProgressBarProps {
  // Progress
  progress: number; // 0 to 1
  value?: number; // Alternative to progress (0 to max)
  max?: number; // Maximum value when using value prop
  
  // Appearance
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  progressColor?: string;
  progressGradient?: string[];
  
  // Labels
  showLabel?: boolean;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  
  // Animation
  animated?: boolean;
  duration?: number;
  
  // Style overrides
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress: progressProp,
  value,
  max = 100,
  height = 8,
  borderRadius = 4,
  backgroundColor,
  progressColor,
  progressGradient,
  showLabel = false,
  label,
  showValue = false,
  valueFormat,
  animated = true,
  duration = 1000,
  style,
  labelStyle,
  valueStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const animatedProgress = useSharedValue(0);
  const animatedWidth = useSharedValue(0);
  
  // Calculate progress
  const progress = useMemo((): number => {
    if (value !== undefined) {
      return Math.max(0, Math.min(1, value / max));
    }
    return Math.max(0, Math.min(1, progressProp));
  }, [progressProp, value, max]);
  
  // Get colors
  const getBackgroundColor = useMemo((): string => {
    if (backgroundColor) return backgroundColor;
    return colors.neutral.surface;
  }, [backgroundColor, colors.neutral.surface]);
  
  const getProgressColor = useMemo((): string => {
    if (progressColor) return progressColor;
    if (progressGradient) return 'transparent';
    return colors.brand.primaryBlue;
  }, [progressColor, progressGradient, colors.brand.primaryBlue]);
  
  // Get progress gradient
  const getProgressGradient = useMemo((): string[] => {
    if (progressGradient) return progressGradient;
    return [colors.brand.primaryBlue, colors.brand.primaryGreen];
  }, [progressGradient, colors.brand.primaryBlue, colors.brand.primaryGreen]);
  
  // Format value display
  const formatValue = useMemo((): string => {
    if (valueFormat) return valueFormat(value !== undefined ? value : progress * max);
    if (value !== undefined) return `${value}/${max}`;
    return `${Math.round(progress * 100)}%`;
  }, [value, max, progress, valueFormat]);
  
  // Animate progress
  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, { duration });
      animatedWidth.value = withSpring(progress, { damping: 15, stiffness: 100 });
    } else {
      animatedProgress.value = progress;
      animatedWidth.value = progress;
    }
  }, [progress, animated, duration, animatedProgress, animatedWidth]);
  
  // Animated styles
  const animatedProgressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animatedWidth.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });
  
  // Render progress fill
  const renderProgressFill = () => {
    const progressFillStyle = {
      height,
      borderRadius,
      backgroundColor: getProgressColor,
    };
    
    if (progressGradient) {
      return (
        <LinearGradient
          colors={getProgressGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[progressFillStyle, { backgroundColor: 'transparent' }]}
        />
      );
    }
    
    return <AnimatedView style={[progressFillStyle, animatedProgressStyle]} />;
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Label and Value Row */}
      {(showLabel || showValue) && (
        <View style={styles.header}>
          {showLabel && (
            <Text style={[styles.label, { color: colors.neutral.textBody }, labelStyle]}>
              {label || 'Progress'}
            </Text>
          )}
          
          {showValue && (
            <Text style={[styles.value, { color: colors.neutral.textMuted }, valueStyle]}>
              {formatValue}
            </Text>
          )}
        </View>
      )}
      
      {/* Progress Bar Container */}
      <View
        style={[
          styles.progressContainer,
          {
            height,
            borderRadius,
            backgroundColor: getBackgroundColor,
          },
        ]}
      >
        {/* Progress Fill */}
        {renderProgressFill()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  value: {
    ...theme.typography.caption,
  },
  progressContainer: {
    width: '100%',
    overflow: 'hidden',
  },
});