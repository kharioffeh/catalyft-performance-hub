/**
 * Catalyft Fitness App - Circular Progress Component
 * Animated circular progress with gradient support and center content
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
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export interface CircularProgressProps {
  // Progress
  progress: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg';
  
  // Appearance
  strokeWidth?: number;
  strokeColor?: string;
  strokeGradient?: string[];
  backgroundColor?: string;
  
  // Center content
  label?: string;
  icon?: React.ReactNode;
  showPercentage?: boolean;
  
  // Animation
  animated?: boolean;
  duration?: number;
  
  // Style overrides
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 'md',
  strokeWidth = 4,
  strokeColor,
  strokeGradient,
  backgroundColor,
  label,
  icon,
  showPercentage = false,
  animated = true,
  duration = 1000,
  style,
  labelStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const animatedProgress = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Get size dimensions
  const getSizeDimensions = useMemo((): { size: number; radius: number } => {
    switch (size) {
      case 'sm':
        return { size: 48, radius: 20 };
      case 'md':
        return { size: 64, radius: 28 };
      case 'lg':
        return { size: 80, radius: 36 };
      default:
        return { size: 64, radius: 28 };
    }
  }, [size]);
  
  // Get stroke color
  const getStrokeColor = useMemo((): string => {
    if (strokeColor) return strokeColor;
    if (strokeGradient) return 'url(#gradient)';
    return colors.brand.primaryBlue;
  }, [strokeColor, strokeGradient, colors.brand.primaryBlue]);
  
  // Get background color
  const getBackgroundColor = useMemo((): string => {
    if (backgroundColor) return backgroundColor;
    return colors.neutral.surface;
  }, [backgroundColor, colors.neutral.surface]);
  
  // Calculate SVG properties
  const { size: svgSize, radius } = getSizeDimensions;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Animate progress
  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, { duration });
      rotation.value = withSpring(360, { damping: 15, stiffness: 100 });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated, duration, animatedProgress, rotation]);
  
  // Animated styles
  const animatedCircleStyle = useAnimatedStyle(() => {
    const animatedStrokeDashoffset = interpolate(
      animatedProgress.value,
      [0, 1],
      [circumference, 0],
      Extrapolate.CLAMP
    );
    
    return {
      strokeDashoffset: animatedStrokeDashoffset,
    };
  });
  
  const animatedRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  // Render center content
  const renderCenterContent = () => {
    if (icon) {
      return icon;
    }
    
    if (label) {
      return (
        <Text style={[styles.label, { color: colors.neutral.textHeading }, labelStyle]}>
          {label}
        </Text>
      );
    }
    
    if (showPercentage) {
      return (
        <Text style={[styles.percentage, { color: colors.neutral.textHeading }, labelStyle]}>
          {Math.round(progress * 100)}%
        </Text>
      );
    }
    
    return null;
  };
  
  // Render progress circle
  const renderProgressCircle = () => {
    const circleProps = {
      cx: svgSize / 2,
      cy: svgSize / 2,
      r: radius,
      stroke: getStrokeColor,
      strokeWidth,
      strokeLinecap: 'round' as const,
      strokeDasharray,
      fill: 'transparent',
    };
    
    if (strokeGradient) {
      return (
        <LinearGradient
          id="gradient"
          colors={strokeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <AnimatedCircle
            {...circleProps}
            style={[animatedCircleStyle, animatedRotationStyle]}
          />
        </LinearGradient>
      );
    }
    
    return (
      <AnimatedCircle
        {...circleProps}
        style={[animatedCircleStyle, animatedRotationStyle]}
      />
    );
  };
  
  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }, style]}>
      <Svg width={svgSize} height={svgSize}>
        {/* Background circle */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={getBackgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        {renderProgressCircle()}
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {renderCenterContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  percentage: {
    ...theme.typography.h3,
    textAlign: 'center',
  },
});