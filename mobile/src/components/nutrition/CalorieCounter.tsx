/**
 * CalorieCounter Component
 * Displays daily calorie intake progress with animated ring
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalorieCounterProps {
  consumed: number;
  goal: number;
  burned?: number;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
  onPress?: () => void;
}

export const CalorieCounter: React.FC<CalorieCounterProps> = ({
  consumed,
  goal,
  burned = 0,
  size = 150,
  strokeWidth = 12,
  showDetails = true,
  onPress,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const styles = createStyles(colors, size);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Calculate values
  const adjustedGoal = goal + burned;
  const percentage = Math.min((consumed / adjustedGoal) * 100, 100);
  const calculatedRemaining = adjustedGoal - consumed;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  
  const getProgressColor = () => {
    if (percentage >= 100) return colors.error;
    if (percentage >= 80) return colors.warning;
    return colors.success;
  };
  
  const containerProps = {
    style: styles.container,
    ...(onPress ? { onPress } : {})
  };
  
  const renderContent = () => (
    <>
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
            strokeDashoffset={strokeDashoffset}
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
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity {...containerProps}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View {...containerProps}>
      {renderContent()}
    </View>
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