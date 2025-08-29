/**
 * Catalyft Fitness App - Enhanced Card Component
 * Modern design system card with variants, shadows, and animations
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
import { BlurView } from 'expo-blur';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export type CardVariant = 'elevated' | 'outlined' | 'glass';
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
  const elevation = useSharedValue(variant === 'elevated' ? 1 : 0);
  
  // Get card styles based on variant and size
  const getCardStyles = (): ViewStyle => {
    const padding = size === 'small'
      ? theme.componentSpacing.cardPaddingSmall
      : size === 'large'
      ? theme.componentSpacing.cardPaddingLarge
      : theme.componentSpacing.cardPadding;
    
    const baseStyle: ViewStyle = {
      padding,
      borderRadius: theme.borderRadius.card,
      width: fullWidth ? '100%' : undefined,
      overflow: 'hidden',
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.surface,
          ...Platform.select({
            ios: {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.surface,
          borderWidth: 1,
          borderColor: colors.neutral.border,
        };
      
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        };
      
      default:
        return baseStyle;
    }
  };
  
  // Handle press animations
  const handlePressIn = useCallback(() => {
    if (disabled) return;
    
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });
    
    if (variant === 'elevated') {
      elevation.value = withSpring(0.5, {
        damping: 15,
        stiffness: 300,
      });
    }
    
    if (haptic) {
      HapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }
  }, [disabled, variant, haptic, scale, elevation]);
  
  const handlePressOut = useCallback(() => {
    if (disabled) return;
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    
    if (variant === 'elevated') {
      elevation.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
    }
  }, [disabled, variant, scale, elevation]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  // Handle press events
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled) return;
    onPress?.(event);
  }, [disabled, onPress]);
  
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (disabled) return;
    onLongPress?.(event);
  }, [disabled, onLongPress]);
  
  // Render card content
  const renderCardContent = () => {
    const cardContent = (
      <View style={[getCardStyles(), contentStyle]}>
        {children}
      </View>
    );
    
    if (variant === 'glass') {
      return (
        <AnimatedBlurView
          intensity={isDark ? 20 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={[getCardStyles(), contentStyle]}
        >
          {children}
        </AnimatedBlurView>
      );
    }
    
    return cardContent;
  };
  
  // Render card based on interaction
  if (onPress || onLongPress) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, style]}
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {renderCardContent()}
      </AnimatedTouchable>
    );
  }
  
  return (
    <View style={[getCardStyles(), style, contentStyle]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});

export default Card;