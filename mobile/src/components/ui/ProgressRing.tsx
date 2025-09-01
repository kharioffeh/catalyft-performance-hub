/**
 * Catalyft Fitness App - Progress Ring Component
 * Circular progress indicator for fitness metrics
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Svg, {
  Circle,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  value?: string | number;
  unit?: string;
  showPercentage?: boolean;
  colors?: string[];
  animated?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  label,
  value,
  unit,
  showPercentage = true,
  colors: customColors,
  animated = true,
  duration = 1000,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const animationProgress = useSharedValue(0);
  const scaleAnimation = useSharedValue(0.9);
  
  // Default gradient colors
  const defaultColors = [themeColors.primary, themeColors.secondary];
  const gradientColors = customColors || defaultColors;
  
  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Start animation on mount or progress change
  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(progress / 100, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      scaleAnimation.value = withSpring(1, { tension: 100, friction: 8 });
    } else {
      animationProgress.value = progress / 100;
      scaleAnimation.value = 1;
    }
  }, [progress, animated, duration, animationProgress, scaleAnimation]);
  
  // Animated props for progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const animatedStrokeDashoffset = interpolate(
      animationProgress.value,
      [0, 1],
      [circumference, circumference - animationProgress.value * circumference]
    );
    
    return {
      strokeDashoffset: animatedStrokeDashoffset,
    };
  });
  
  // Animated color based on progress
  const animatedColorProps = useAnimatedProps(() => {
    const strokeColor = interpolateColor(
      animationProgress.value,
      [0, 0.5, 1],
      [themeColors.error, themeColors.warning, themeColors.success]
    );
    
    return {
      stroke: customColors ? undefined : strokeColor,
    };
  });
  
  // Get display value
  const displayValue = value !== undefined 
    ? value 
    : showPercentage 
    ? `${Math.round(progress)}%` 
    : '';
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { width: size, height: size },
        { transform: [{ scale: scaleAnimation.value }] },
        style
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity="1"
              />
            ))}
          </LinearGradient>
        </Defs>
        
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={themeColors.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={customColors ? "url(#progressGradient)" : undefined}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            {...(customColors ? animatedCircleProps : { ...animatedCircleProps, ...animatedColorProps })}
          />
        </G>
        
        {/* Center content */}
        <G>
          {displayValue && (
            <SvgText
              x={size / 2}
              y={size / 2 - (label ? 8 : 0)}
              fontSize={size / 5}
              fontWeight="bold"
              fill={themeColors.text}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {displayValue}
            </SvgText>
          )}
          
          {unit && (
            <SvgText
              x={size / 2}
              y={size / 2 + (size / 10)}
              fontSize={size / 10}
              fill={themeColors.textSecondary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {unit}
            </SvgText>
          )}
          
          {label && (
            <SvgText
              x={size / 2}
              y={size / 2 + (unit ? size / 5 : size / 8)}
              fontSize={size / 12}
              fill={themeColors.textSecondary}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          )}
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRing;