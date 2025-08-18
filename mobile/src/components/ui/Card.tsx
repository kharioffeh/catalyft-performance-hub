/**
 * Catalyft Fitness App - Card Component
 * Flexible container with elevation, borders, and press states
 */

import React, { useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardSize = 'small' | 'medium' | 'large';

export interface CardProps {
  children: React.ReactNode;
  
  // Appearance
  variant?: CardVariant;
  size?: CardSize;
  fullWidth?: boolean;
  
  // Behavior
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  haptic?: boolean;
  
  // Style overrides
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  size = 'medium',
  fullWidth = false,
  onPress,
  onLongPress,
  disabled = false,
  haptic = true,
  style,
  contentStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(variant === 'elevated' ? 4 : 0);
  
  // Get card styles based on variant
  const getCardStyles = (): ViewStyle => {
    const padding = size === 'small'
      ? theme.spacing.component.cardPaddingSmall
      : size === 'large'
      ? theme.spacing.component.cardPaddingLarge
      : theme.spacing.component.cardPadding;
    
    const baseStyle: ViewStyle = {
      padding,
      borderRadius: theme.borderRadius.card,
      width: fullWidth ? '100%' : undefined,
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: theme.borderWidth.thin,
          borderColor: colors.border,
        };
      
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.surfaceSecondary,
        };
      
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      
      default:
        return baseStyle;
    }
  };
  
  // Handle press in
  const handlePressIn = useCallback(() => {
    'worklet';
    if (onPress) {
      scale.value = withSpring(0.98, theme.animation.spring.snappy);
      if (variant === 'elevated') {
        elevation.value = withTiming(2, theme.animation.timing.fast);
      }
    }
  }, [scale, elevation, onPress, variant]);
  
  // Handle press out
  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, theme.animation.spring.snappy);
    if (variant === 'elevated') {
      elevation.value = withTiming(4, theme.animation.timing.fast);
    }
  }, [scale, elevation, variant]);
  
  // Handle press with haptic feedback
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (haptic && !disabled) {
      HapticFeedback.trigger('impactLight');
    }
    onPress?.(event);
  }, [onPress, haptic, disabled]);
  
  // Handle long press with haptic feedback
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (haptic && !disabled) {
      HapticFeedback.trigger('impactMedium');
    }
    onLongPress?.(event);
  }, [onLongPress, haptic, disabled]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const animatedElevation = variant === 'elevated' 
      ? Platform.select({
          android: { elevation: elevation.value },
          ios: {
            shadowOpacity: elevation.value / 40,
            shadowRadius: elevation.value,
          },
        })
      : {};
    
    return {
      transform: [{ scale: scale.value }],
      ...animatedElevation,
    };
  });
  
  // If not pressable, render as a simple view
  if (!onPress && !onLongPress) {
    return (
      <Animated.View style={[getCardStyles(), animatedStyle, style]}>
        <View style={contentStyle}>
          {children}
        </View>
      </Animated.View>
    );
  }
  
  // Render pressable card
  return (
    <AnimatedTouchable
      style={[getCardStyles(), animatedStyle, style]}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <View style={contentStyle}>
        {children}
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Card;