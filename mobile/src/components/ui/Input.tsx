/**
 * Catalyft Fitness App - Enhanced Input Component
 * Modern design system input with floating labels and states
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  useColorScheme,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedText = Animated.createAnimatedComponent(Text);

export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Content
  label?: string;
  placeholder?: string;
  value?: string;
  
  // Appearance
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  
  // States
  error?: string;
  success?: boolean;
  successMessage?: string;
  disabled?: boolean;
  
  // Features
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  
  // Style overrides
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
  error,
  success = false,
  disabled = false,
  leftIcon,
  rightIcon,
  clearable = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  containerStyle,
  onChangeText,
  onFocus,
  onBlur,
  ...inputProps
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const labelPosition = useSharedValue(hasValue ? 1 : 0);
  const borderColor = useSharedValue(colors.neutral.border);
  const shakeOffset = useSharedValue(0);
  
  // Get input dimensions based on size
  const getInputDimensions = useCallback((): { height: number; paddingHorizontal: number } => {
    switch (size) {
      case 'sm':
        return { height: 40, paddingHorizontal: 12 };
      case 'md':
        return { height: 56, paddingHorizontal: 16 };
      case 'lg':
        return { height: 64, paddingHorizontal: 20 };
      default:
        return { height: 56, paddingHorizontal: 16 };
    }
  }, [size]);
  
  // Get input styles based on variant and state
  const getInputStyles = useCallback((): ViewStyle => {
    const { height, paddingHorizontal } = getInputDimensions();
    
    const baseStyle: ViewStyle = {
      height,
      paddingHorizontal,
      borderRadius: theme.borderRadius.input,
      borderWidth: 1,
      borderColor: borderColor.value,
      backgroundColor: colors.neutral.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    };
    
    if (fullWidth) {
      baseStyle.width = '100%';
    }
    
    // Apply variant-specific styles
    switch (variant) {
      case 'underlined':
        baseStyle.borderWidth = 0;
        baseStyle.borderBottomWidth = 2;
        baseStyle.borderRadius = 0;
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'filled':
        baseStyle.backgroundColor = colors.neutral.surface;
        break;
      case 'outlined':
        baseStyle.backgroundColor = 'transparent';
        break;
      default:
        baseStyle.backgroundColor = colors.neutral.surface;
    }
    
    if (disabled) {
      baseStyle.opacity = 0.5;
      baseStyle.backgroundColor = colors.neutral.surface;
    }
    
    if (error) {
      baseStyle.borderColor = colors.brand.dangerRed;
    } else if (success) {
      baseStyle.borderColor = colors.brand.primaryGreen;
    } else if (isFocused) {
      baseStyle.borderColor = colors.brand.primaryBlue;
    }
    
    return baseStyle;
  }, [variant, size, fullWidth, disabled, error, success, isFocused, colors, getInputDimensions, borderColor]);
  
  // Get label styles
  const getLabelStyles = useCallback((): TextStyle => {
    const baseLabelStyle: TextStyle = {
      ...theme.typography.caption,
      color: colors.neutral.textMuted,
      position: 'absolute',
      left: getInputDimensions().paddingHorizontal,
      zIndex: 1,
    };
    
    if (error) {
      baseLabelStyle.color = colors.brand.dangerRed;
    } else if (success) {
      baseLabelStyle.color = colors.brand.primaryGreen;
    } else if (isFocused) {
      baseLabelStyle.color = colors.brand.primaryBlue;
    }
    
    return baseLabelStyle;
  }, [error, success, isFocused, colors, getInputDimensions]);
  
  // Handle focus
  const handleFocus = useCallback((event: any) => {
    setIsFocused(true);
    labelPosition.value = withSpring(1, { damping: 15, stiffness: 300 });
    borderColor.value = withTiming(colors.brand.primaryBlue, { duration: 200 });
    onFocus?.(event);
  }, [colors.brand.primaryBlue, onFocus, labelPosition, borderColor]);
  
  // Handle blur
  const handleBlur = useCallback((event: any) => {
    setIsFocused(false);
    if (!hasValue) {
      labelPosition.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
    borderColor.value = withTiming(colors.neutral.border, { duration: 200 });
    onBlur?.(event);
  }, [hasValue, colors.neutral.border, onBlur, labelPosition, borderColor]);
  
  // Handle text change
  const handleTextChange = useCallback((text: string) => {
    const newHasValue = !!text;
    setHasValue(newHasValue);
    
    if (newHasValue && !hasValue) {
      labelPosition.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else if (!newHasValue && hasValue) {
      labelPosition.value = withSpring(0, { damping: 15, stiffness: 300 });
    }
    
    onChangeText?.(text);
  }, [hasValue, onChangeText, labelPosition]);
  
  // Handle clear
  const handleClear = useCallback(() => {
    handleTextChange('');
    inputRef.current?.focus();
  }, [handleTextChange]);
  
  // Handle error shake animation
  const triggerErrorShake = useCallback(() => {
    if (error) {
      shakeOffset.value = withSpring(10, { damping: 10, stiffness: 100 });
      setTimeout(() => {
        shakeOffset.value = withSpring(-10, { damping: 10, stiffness: 100 });
        setTimeout(() => {
          shakeOffset.value = withSpring(0, { damping: 10, stiffness: 100 });
        }, 100);
      }, 100);
    }
  }, [error, shakeOffset]);
  
  // Animated styles
  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      labelPosition.value,
      [0, 1],
      [0, -20],
      Extrapolate.CLAMP
    );
    
    const scale = interpolate(
      labelPosition.value,
      [0, 1],
      [1, 0.85],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  });
  
  const animatedInputStyle = useAnimatedStyle(() => {
    const translateX = shakeOffset.value;
    
    return {
      transform: [{ translateX }],
    };
  });
  
  // Render left icon
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <View style={styles.iconContainer}>
        {leftIcon}
      </View>
    );
  };
  
  // Render right icon
  const renderRightIcon = () => {
    if (!rightIcon && !clearable) return null;
    
    return (
      <View style={styles.iconContainer}>
        {rightIcon}
        {clearable && hasValue && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.neutral.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Render success icon
  const renderSuccessIcon = () => {
    if (!success) return null;
    
    return (
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={20} color={colors.brand.primaryGreen} />
      </View>
    );
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Floating Label */}
      {label && (
        <AnimatedText style={[getLabelStyles(), animatedLabelStyle, labelStyle]}>
          {label}
        </AnimatedText>
      )}
      
      {/* Input Container */}
      <Animated.View style={[getInputStyles(), animatedInputStyle, style]}>
        {renderLeftIcon()}
        
        <AnimatedTextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.neutral.textHeading,
              fontSize: theme.typography.body.fontSize,
              flex: 1,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!label ? placeholder : undefined}
          placeholderTextColor={colors.neutral.textMuted}
          editable={!disabled}
          {...inputProps}
        />
        
        {renderSuccessIcon()}
        {renderRightIcon()}
      </Animated.View>
      
      {/* Error Message */}
      {error && (
        <Animated.View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={colors.brand.dangerRed} />
          <Text style={[styles.errorText, { color: colors.brand.dangerRed }, errorStyle]}>
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    ...theme.typography.caption,
    flex: 1,
  },
});