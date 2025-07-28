import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

interface StrainDialProps {
  currentStrain: number;
  targetStrain: number;
  sessionType: string;
  size?: number;
}

export const StrainDial: React.FC<StrainDialProps> = ({
  currentStrain,
  targetStrain,
  sessionType,
  size = 200,
}) => {
  const animatedValue = useSharedValue(0);
  const targetValue = useSharedValue(0);

  const radius = size / 2 - 20;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedValue.value = withSpring(currentStrain / 21, {
      damping: 15,
      stiffness: 150,
    });
    targetValue.value = withSpring(targetStrain / 21, {
      damping: 15,
      stiffness: 150,
    });
  }, [currentStrain, targetStrain]);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = animatedValue.value;
    const strokeDashoffset = circumference - (progress * circumference);
    
    // Color interpolation based on how close to target
    const difference = Math.abs(currentStrain - targetStrain);
    let color = '#22c55e'; // green - on target
    
    if (difference > 4) {
      color = '#ef4444'; // red - far from target
    } else if (difference > 2) {
      color = '#f59e0b'; // amber - slightly off target
    }

    return {
      strokeDashoffset,
      stroke: color,
    };
  });

  const targetAnimatedStyle = useAnimatedStyle(() => {
    const progress = targetValue.value;
    const strokeDashoffset = circumference - (progress * circumference);
    
    return {
      strokeDashoffset,
    };
  });

  const getStrainZoneColor = (strain: number) => {
    if (strain <= 6) return '#22c55e'; // Recovery - Green
    if (strain <= 10) return '#3b82f6'; // Low - Blue
    if (strain <= 14) return '#f59e0b'; // Moderate - Amber
    if (strain <= 18) return '#f97316'; // High - Orange
    return '#ef4444'; // Very High - Red
  };

  const getStrainZoneLabel = (strain: number) => {
    if (strain <= 6) return 'Recovery';
    if (strain <= 10) return 'Low';
    if (strain <= 14) return 'Moderate';
    if (strain <= 18) return 'High';
    return 'Very High';
  };

  const getOptimalZoneMessage = () => {
    const difference = currentStrain - targetStrain;
    if (Math.abs(difference) <= 1) {
      return 'Perfect! You\'re in the optimal strain zone.';
    } else if (difference > 1) {
      return 'Consider reducing intensity to hit target zone.';
    } else {
      return 'Room to increase intensity to reach target.';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Target strain indicator */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(34, 197, 94, 0.3)"
          strokeWidth={4}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - ((targetStrain / 21) * circumference)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Current strain progress */}
        <Animated.Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={animatedStyle}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={styles.currentValue}>{currentStrain.toFixed(1)}</Text>
        <Text style={styles.maxValue}>/ 21</Text>
        <Text style={[styles.zoneLabel, { color: getStrainZoneColor(currentStrain) }]}>
          {getStrainZoneLabel(currentStrain)}
        </Text>
      </View>
      
      {/* Target indicator */}
      <View style={[styles.targetIndicator, {
        top: size / 2 - 40 + (Math.cos((-90 + (targetStrain / 21) * 360) * Math.PI / 180) * radius),
        left: size / 2 - 15 + (Math.sin((-90 + (targetStrain / 21) * 360) * Math.PI / 180) * radius),
      }]}>
        <View style={styles.targetDot} />
        <Text style={styles.targetLabel}>Target</Text>
      </View>
      
      {/* Optimal zone message */}
      <View style={styles.messageContainer}>
        <Text style={styles.sessionTypeLabel}>{sessionType.toUpperCase()}</Text>
        <Text style={styles.optimalMessage}>{getOptimalZoneMessage()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  maxValue: {
    fontSize: 16,
    color: '#888',
    marginTop: -4,
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  targetLabel: {
    fontSize: 8,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 2,
  },
  messageContainer: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
    width: '100%',
  },
  sessionTypeLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  optimalMessage: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default StrainDial;