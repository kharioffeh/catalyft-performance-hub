/**
 * CalorieCounter Component
 * Displays daily calorie intake with circular progress visualization
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieCounterProps {
  consumed: number;
  goal: number;
  remaining?: number;
  burned?: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
  onPress?: () => void;
}

export const CalorieCounter: React.FC<CalorieCounterProps> = ({
  consumed,
  goal,
  remaining,
  burned = 0,
  size = 200,
  strokeWidth = 12,
  showDetails = true,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  const styles = createStyles(colors, size);

  const progress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const calculatedRemaining = remaining ?? goal - consumed + burned;
  const percentage = Math.min((consumed / goal) * 100, 100);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage < 80) return colors.primary;
    if (percentage < 100) return colors.warning;
    return colors.error;
  };

  useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1000 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [circumference, 0]
    );
    return {
      strokeDashoffset,
    };
  });

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </G>
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.consumed}>{consumed}</Text>
        <Text style={styles.goalText}>/ {goal} cal</Text>
        
        {showDetails && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons
                name="flame"
                size={14}
                color={colors.error}
              />
              <Text style={styles.detailText}>
                {calculatedRemaining > 0 ? calculatedRemaining : 0} left
              </Text>
            </View>
            
            {burned > 0 && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="fitness"
                  size={14}
                  color={colors.success}
                />
                <Text style={styles.detailText}>
                  {burned} burned
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {percentage >= 100 && (
        <View style={styles.badge}>
          <Ionicons
            name="warning"
            size={16}
            color={colors.background}
          />
        </View>
      )}
    </Container>
  );
};

const createStyles = (colors: any, size: number) =>
  StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    svg: {
      position: 'absolute',
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    consumed: {
      fontSize: size * 0.18,
      fontWeight: '700',
      color: colors.text,
    },
    goalText: {
      fontSize: size * 0.07,
      color: colors.textSecondary,
      marginTop: 2,
    },
    details: {
      marginTop: theme.spacing.sm,
      alignItems: 'center',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    detailText: {
      fontSize: size * 0.06,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    badge: {
      position: 'absolute',
      top: size * 0.15,
      right: size * 0.15,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default CalorieCounter;