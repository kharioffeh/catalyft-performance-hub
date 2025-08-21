/**
 * Catalyft Fitness App - Button Component
 * Versatile button with multiple variants and states
 */

import React, { useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from '../../utils/reanimated-mock';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  // Content
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  
  // State
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  
  // Behavior
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  haptic?: boolean;
  hapticType?: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'selection';
  
  // Style overrides
  style?: ViewStyle;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rounded = false,
  disabled = false,
  loading = false,
  selected = false,
  onPress,
  onLongPress,
  haptic = true,
  hapticType = 'impactLight',
  style,
  textStyle,
  containerStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Get button styles based on variant
  const getButtonStyles = useCallback((): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: size === 'small' 
        ? theme.spacing.component.buttonPaddingHorizontalSmall
        : size === 'large'
        ? theme.spacing.component.buttonPaddingHorizontalLarge
        : theme.spacing.component.buttonPaddingHorizontal,
      paddingVertical: size === 'small'
        ? theme.spacing.component.buttonPaddingVerticalSmall
        : size === 'large'
        ? theme.spacing.component.buttonPaddingVerticalLarge
        : theme.spacing.component.buttonPaddingVertical,
      borderRadius: rounded 
        ? theme.borderRadius.full
        : size === 'small'
        ? theme.borderRadius.buttonSmall
        : size === 'large'
        ? theme.borderRadius.buttonLarge
        : theme.borderRadius.button,
      minHeight: size === 'small'
        ? theme.dimensions.buttonHeightSmall
        : size === 'large'
        ? theme.dimensions.buttonHeightLarge
        : theme.dimensions.buttonHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };
    
    if (fullWidth) {
      baseStyle.width = '100%';
    }
    
    // Apply variant styles
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textDisabled : colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textDisabled : colors.secondary,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textDisabled : colors.success,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textDisabled : colors.warning,
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textDisabled : colors.error,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: theme.borderWidth.thin,
          borderColor: disabled 
            ? colors.textDisabled 
            : variant === 'outline' 
            ? colors.border 
            : colors.primary,
        };
      default:
        return baseStyle;
    }
  }, [variant, size, rounded, fullWidth, disabled, colors]);
  
  // Get text styles based on variant
  const getTextStyles = useCallback((): TextStyle => {
    const baseStyle: TextStyle = size === 'small'
      ? theme.typography.styles.buttonSmall
      : theme.typography.styles.button;
    
    let color: string;
    
    if (disabled) {
      color = variant === 'ghost' || variant === 'outline' 
        ? colors.textDisabled 
        : colors.textOnPrimary;
    } else {
      switch (variant) {
        case 'ghost':
        case 'outline':
          color = colors.text;
          break;
        default:
          color = colors.textOnPrimary;
      }
    }
    
    return {
      ...baseStyle,
      color,
    };
  }, [variant, size, disabled, colors]);
  
  // Handle press in
  const handlePressIn = useCallback(() => {
    'worklet';
    scale.value = withSpring(0.95, theme.animation.spring.snappy);
    opacity.value = withTiming(0.8, theme.animation.timing.fast);
  }, [scale, opacity]);
  
  // Handle press out
  const handlePressOut = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, theme.animation.spring.snappy);
    opacity.value = withTiming(1, theme.animation.timing.fast);
  }, [scale, opacity]);
  
  // Handle press with haptic feedback
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (haptic && !disabled && !loading) {
      HapticFeedback.trigger(hapticType);
    }
    onPress?.(event);
  }, [onPress, haptic, hapticType, disabled, loading]);
  
  // Handle long press with haptic feedback
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (haptic && !disabled && !loading) {
      HapticFeedback.trigger('impactHeavy');
    }
    onLongPress?.(event);
  }, [onLongPress, haptic, disabled, loading]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  // Memoized styles
  const buttonStyles = useMemo(() => getButtonStyles(), [getButtonStyles]);
  const textStyles = useMemo(() => getTextStyles(), [getTextStyles]);
  
  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'ghost' || variant === 'outline' ? colors.text : colors.textOnPrimary}
        />
      );
    }
    
    return (
      <>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        {children || (title && <Text style={[textStyles, textStyle]}>{title}</Text>)}
        {icon && iconPosition === 'right' && (
          <View style={[styles.iconContainer, styles.iconRight]}>
            {icon}
          </View>
        )}
      </>
    );
  };
  
  return (
    <View style={containerStyle}>
      <AnimatedTouchable
        style={[buttonStyles, animatedStyle, style]}
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderContent()}
      </AnimatedTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: theme.spacing.component.iconSpacing,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: theme.spacing.component.iconSpacing,
  },
});

export default Button;