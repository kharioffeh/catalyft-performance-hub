/**
 * Catalyft Fitness App - Enhanced Button Component
 * Modern design system button with gradient, variants, and animations
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
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

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
  size = 'md',
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
  
  // Get button dimensions based on size
  const getButtonDimensions = useCallback((): { height: number; paddingHorizontal: number } => {
    switch (size) {
      case 'sm':
        return { height: 40, paddingHorizontal: 16 };
      case 'md':
        return { height: 48, paddingHorizontal: 24 };
      case 'lg':
        return { height: 56, paddingHorizontal: 32 };
      case 'xl':
        return { height: 64, paddingHorizontal: 40 };
      default:
        return { height: 48, paddingHorizontal: 24 };
    }
  }, [size]);
  
  // Get button styles based on variant
  const getButtonStyles = useCallback((): ViewStyle => {
    const { height, paddingHorizontal } = getButtonDimensions();
    
    const baseStyle: ViewStyle = {
      height,
      paddingHorizontal,
      borderRadius: rounded ? height / 2 : theme.borderRadius.button,
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          // Primary uses gradient background
        };
      
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primaryGreen,
        };
      
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.brand.primaryBlue,
        };
      
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      
      default:
        return baseStyle;
    }
  }, [variant, size, fullWidth, rounded, colors, getButtonDimensions]);
  
  // Get text styles based on variant
  const getTextStyles = useCallback((): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...theme.typography.body,
      fontWeight: '600',
      textAlign: 'center',
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: '#FFFFFF',
        };
      
      case 'secondary':
        return {
          ...baseTextStyle,
          color: '#FFFFFF',
        };
      
      case 'outline':
        return {
          ...baseTextStyle,
          color: colors.brand.primaryBlue,
        };
      
      case 'ghost':
        return {
          ...baseTextStyle,
          color: colors.brand.primaryBlue,
        };
      
      default:
        return baseTextStyle;
    }
  }, [variant, colors]);
  
  // Handle press animations
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });
    
    if (haptic) {
      // Haptic feedback is removed, so this block is effectively removed.
      // If haptic feedback is needed, it must be re-implemented.
    }
  }, [disabled, loading, haptic, scale]);
  
  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  }, [disabled, loading, scale]);
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  // Handle press events
  const handlePress = useCallback((event: GestureResponderEvent) => {
    if (disabled || loading) return;
    onPress?.(event);
  }, [disabled, loading, onPress]);
  
  const handleLongPress = useCallback((event: GestureResponderEvent) => {
    if (disabled || loading) return;
    onLongPress?.(event);
  }, [disabled, loading, onLongPress]);
  
  // Render button content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.brand.primaryBlue} 
        />
      );
    }
    
    const content = (
      <>
        {icon && iconPosition === 'left' && icon}
        {title && <Text style={[getTextStyles(), textStyle]}>{title}</Text>}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    );
    
    return content;
  };
  
  // Render button based on variant
  const renderButton = () => {
    const buttonProps = {
      style: [getButtonStyles(), animatedStyle, style],
      onPress: handlePress,
      onLongPress: handleLongPress,
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      disabled: disabled || loading,
      activeOpacity: 1,
    };
    
    if (variant === 'primary') {
      return (
        <LinearGradient
          colors={['#0057FF', '#003FCC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getButtonStyles(), { backgroundColor: 'transparent' }]}
        >
          <AnimatedTouchable {...buttonProps} style={[buttonProps.style, { backgroundColor: 'transparent' }]}>
            {renderContent()}
          </AnimatedTouchable>
        </LinearGradient>
      );
    }
    
    return (
      <AnimatedTouchable {...buttonProps}>
        {renderContent()}
      </AnimatedTouchable>
    );
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {renderButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
});