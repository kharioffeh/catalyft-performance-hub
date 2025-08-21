/**
 * Catalyft Fitness App - Macro Chart Component
 * Visualize macronutrient distribution (protein, carbs, fat)
 */

import React, { useEffect, useMemo } from 'react';
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
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
  calories?: number;
}

export interface MacroChartProps {
  data: MacroData;
  target?: MacroData;
  size?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  showCalories?: boolean;
  variant?: 'pie' | 'donut' | 'bars';
  animated?: boolean;
  style?: ViewStyle;
}

export const MacroChart: React.FC<MacroChartProps> = ({
  data,
  target,
  size = 200,
  showLabels = true,
  showPercentages = true,
  showCalories = true,
  variant = 'donut',
  animated = true,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const animationProgress = useSharedValue(0);
  const scaleAnimation = useSharedValue(0);
  
  // Calculate totals and percentages
  const total = data.protein + data.carbs + data.fat;
  const proteinPercentage = total > 0 ? (data.protein / total) * 100 : 0;
  const carbsPercentage = total > 0 ? (data.carbs / total) * 100 : 0;
  const fatPercentage = total > 0 ? (data.fat / total) * 100 : 0;
  
  // Calculate calories if not provided
  const calculatedCalories = data.calories || (data.protein * 4 + data.carbs * 4 + data.fat * 9);
  
  // Colors for macros
  const macroColors = {
    protein: colors.protein,
    carbs: colors.carbs,
    fat: colors.fat,
  };
  
  // Calculate pie chart dimensions
  const radius = size / 2;
  const innerRadius = variant === 'donut' ? radius * 0.6 : 0;
  const strokeWidth = radius - innerRadius;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  
  // Calculate stroke dash arrays
  const proteinDash = (proteinPercentage / 100) * circumference;
  const carbsDash = (carbsPercentage / 100) * circumference;
  const fatDash = (fatPercentage / 100) * circumference;
  
  const proteinOffset = 0;
  const carbsOffset = -proteinDash;
  const fatOffset = -(proteinDash + carbsDash);
  
  // Animated props for circles - moved outside of renderPieChart
  const animatedProteinProps = useAnimatedProps(() => ({
    strokeDasharray: `${interpolate(animationProgress.value, [0, 1], [0, proteinDash])} ${circumference}`,
  }));
  
  const animatedCarbsProps = useAnimatedProps(() => ({
    strokeDasharray: `${interpolate(animationProgress.value, [0, 1], [0, carbsDash])} ${circumference}`,
  }));
  
  const animatedFatProps = useAnimatedProps(() => ({
    strokeDasharray: `${interpolate(animationProgress.value, [0, 1], [0, fatDash])} ${circumference}`,
  }));
  
  // Start animation on mount
  useEffect(() => {
    if (animated) {
      animationProgress.value = withTiming(1, {
        duration: theme.animation.duration.slow,
        easing: theme.animation.easing.easeOutCubic,
      });
      scaleAnimation.value = withSpring(1, theme.animation.spring.bouncy);
    } else {
      animationProgress.value = 1;
      scaleAnimation.value = 1;
    }
  }, [animated, animationProgress, scaleAnimation]);
  
  // Render pie/donut chart
  const renderPieChart = () => {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={macroColors.protein} stopOpacity="1" />
            <Stop offset="100%" stopColor={macroColors.protein} stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="carbsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={macroColors.carbs} stopOpacity="1" />
            <Stop offset="100%" stopColor={macroColors.carbs} stopOpacity="0.8" />
          </LinearGradient>
          <LinearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={macroColors.fat} stopOpacity="1" />
            <Stop offset="100%" stopColor={macroColors.fat} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          {/* Background circle */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          
          {/* Protein arc */}
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke="url(#proteinGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDashoffset={proteinOffset}
            animatedProps={animatedProteinProps}
            strokeLinecap="round"
          />
          
          {/* Carbs arc */}
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke="url(#carbsGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDashoffset={carbsOffset}
            animatedProps={animatedCarbsProps}
            strokeLinecap="round"
          />
          
          {/* Fat arc */}
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke="url(#fatGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDashoffset={fatOffset}
            animatedProps={animatedFatProps}
            strokeLinecap="round"
          />
        </G>
        
        {/* Center text for donut chart */}
        {variant === 'donut' && showCalories && (
          <G>
            <SvgText
              x={radius}
              y={radius - 10}
              fontSize={24}
              fontWeight="bold"
              fill={colors.text}
              textAnchor="middle"
            >
              {calculatedCalories}
            </SvgText>
            <SvgText
              x={radius}
              y={radius + 10}
              fontSize={12}
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              calories
            </SvgText>
          </G>
        )}
      </Svg>
    );
  };
  
  // Render bar chart
  const renderBarChart = () => {
    const barWidth = size / 4;
    const maxHeight = size * 0.7;
    const maxValue = Math.max(data.protein, data.carbs, data.fat, target?.protein || 0, target?.carbs || 0, target?.fat || 0);
    
    const proteinHeight = (data.protein / maxValue) * maxHeight;
    const carbsHeight = (data.carbs / maxValue) * maxHeight;
    const fatHeight = (data.fat / maxValue) * maxHeight;
    
    const targetProteinHeight = target ? (target.protein / maxValue) * maxHeight : 0;
    const targetCarbsHeight = target ? (target.carbs / maxValue) * maxHeight : 0;
    const targetFatHeight = target ? (target.fat / maxValue) * maxHeight : 0;
    
    return (
      <View style={styles.barChart}>
        {/* Protein bar */}
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: barWidth }]}>
            {target && (
              <View
                style={[
                  styles.targetBar,
                  {
                    height: targetProteinHeight,
                    backgroundColor: colors.border,
                  },
                ]}
              />
            )}
            <Animated.View
              style={[
                styles.actualBar,
                {
                  height: animationProgress.value ? proteinHeight * animationProgress.value : 0,
                  backgroundColor: macroColors.protein,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.text }]}>Protein</Text>
          <Text style={[styles.barValue, { color: colors.textSecondary }]}>{data.protein}g</Text>
        </View>
        
        {/* Carbs bar */}
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: barWidth }]}>
            {target && (
              <View
                style={[
                  styles.targetBar,
                  {
                    height: targetCarbsHeight,
                    backgroundColor: colors.border,
                  },
                ]}
              />
            )}
            <Animated.View
              style={[
                styles.actualBar,
                {
                  height: animationProgress.value ? carbsHeight * animationProgress.value : 0,
                  backgroundColor: macroColors.carbs,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.text }]}>Carbs</Text>
          <Text style={[styles.barValue, { color: colors.textSecondary }]}>{data.carbs}g</Text>
        </View>
        
        {/* Fat bar */}
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: barWidth }]}>
            {target && (
              <View
                style={[
                  styles.targetBar,
                  {
                    height: targetFatHeight,
                    backgroundColor: colors.border,
                  },
                ]}
              />
            )}
            <Animated.View
              style={[
                styles.actualBar,
                {
                  height: animationProgress.value ? fatHeight * animationProgress.value : 0,
                  backgroundColor: macroColors.fat,
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: colors.text }]}>Fat</Text>
          <Text style={[styles.barValue, { color: colors.textSecondary }]}>{data.fat}g</Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ scale: scaleAnimation.value }] }}>
        {variant === 'bars' ? renderBarChart() : renderPieChart()}
      </Animated.View>
      
      {showLabels && variant !== 'bars' && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: macroColors.protein }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>
              Protein {showPercentages && `(${proteinPercentage.toFixed(0)}%)`}
            </Text>
            <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
              {data.protein}g
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: macroColors.carbs }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>
              Carbs {showPercentages && `(${carbsPercentage.toFixed(0)}%)`}
            </Text>
            <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
              {data.carbs}g
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: macroColors.fat }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>
              Fat {showPercentages && `(${fatPercentage.toFixed(0)}%)`}
            </Text>
            <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
              {data.fat}g
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 200,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: theme.spacing.s2,
  },
  targetBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.3,
    borderRadius: theme.borderRadius.sm,
  },
  actualBar: {
    width: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  barLabel: {
    marginTop: theme.spacing.s2,
    ...theme.typography.styles.caption,
  },
  barValue: {
    ...theme.typography.styles.caption,
  },
  legend: {
    marginTop: theme.spacing.s4,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.s1,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.s2,
  },
  legendLabel: {
    flex: 1,
    ...theme.typography.styles.bodySmall,
  },
  legendValue: {
    ...theme.typography.styles.bodySmall,
  },
});

export default MacroChart;