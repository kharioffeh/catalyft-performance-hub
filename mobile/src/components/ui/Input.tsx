/**
 * Catalyft Fitness App - Input Component
 * Text input with validation, icons, and various states
 */

import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
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
  interpolateColor,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export type InputSize = 'small' | 'medium' | 'large';
export type InputVariant = 'outlined' | 'filled' | 'underlined';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Label and placeholder
  label?: string;
  placeholder?: string;
  helperText?: string;
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  
  // Validation
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  required?: boolean;
  
  // Appearance
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  
  // Style overrides
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export const Input = forwardRef<InputRef, InputProps>(({
  label,
  placeholder,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error = false,
  errorMessage,
  success = false,
  successMessage,
  required = false,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  onChangeText,
  value,
  ...textInputProps
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  
  // Animation values
  const focusAnimation = useSharedValue(0);
  const labelAnimation = useSharedValue(localValue ? 1 : 0);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setLocalValue('');
      onChangeText?.('');
    },
    isFocused: () => inputRef.current?.isFocused() || false,
  }));
  
  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusAnimation.value = withSpring(1, theme.animation.spring.snappy);
    if (!localValue) {
      labelAnimation.value = withSpring(1, theme.animation.spring.snappy);
    }
    onFocus?.();
  }, [focusAnimation, labelAnimation, localValue, onFocus]);
  
  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusAnimation.value = withSpring(0, theme.animation.spring.snappy);
    if (!localValue) {
      labelAnimation.value = withSpring(0, theme.animation.spring.snappy);
    }
    onBlur?.();
  }, [focusAnimation, labelAnimation, localValue, onBlur]);
  
  // Handle text change
  const handleChangeText = useCallback((text: string) => {
    setLocalValue(text);
    if (text && labelAnimation.value === 0) {
      labelAnimation.value = withSpring(1, theme.animation.spring.snappy);
    } else if (!text && !isFocused) {
      labelAnimation.value = withSpring(0, theme.animation.spring.snappy);
    }
    onChangeText?.(text);
  }, [labelAnimation, isFocused, onChangeText]);
  
  // Get container styles based on variant
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
    };
    
    if (variant === 'underlined') {
      return {
        ...baseStyle,
        borderBottomWidth: theme.borderWidth.thin,
        borderBottomColor: error 
          ? colors.error 
          : success 
          ? colors.success 
          : isFocused 
          ? colors.primary 
          : colors.border,
        paddingBottom: theme.spacing.s2,
      };
    }
    
    const containerHeight = size === 'small'
      ? theme.dimensions.inputHeightSmall
      : size === 'large'
      ? theme.dimensions.inputHeightLarge
      : theme.dimensions.inputHeight;
    
    const paddingHorizontal = size === 'small'
      ? theme.spacing.component.inputPaddingHorizontalSmall
      : size === 'large'
      ? theme.spacing.component.inputPaddingHorizontalLarge
      : theme.spacing.component.inputPaddingHorizontal;
    
    const paddingVertical = size === 'small'
      ? theme.spacing.component.inputPaddingVerticalSmall
      : size === 'large'
      ? theme.spacing.component.inputPaddingVerticalLarge
      : theme.spacing.component.inputPaddingVertical;
    
    return {
      ...baseStyle,
      minHeight: containerHeight,
      paddingHorizontal,
      paddingVertical,
      backgroundColor: variant === 'filled' 
        ? colors.surfaceSecondary 
        : 'transparent',
      borderWidth: variant === 'outlined' ? theme.borderWidth.thin : 0,
      borderColor: error 
        ? colors.error 
        : success 
        ? colors.success 
        : isFocused 
        ? colors.primary 
        : colors.border,
      borderRadius: theme.borderRadius.input,
    };
  };
  
  // Get text input styles
  const getInputStyles = (): TextStyle => {
    const fontSize = size === 'small'
      ? theme.typography.sizes.small
      : size === 'large'
      ? theme.typography.sizes.large
      : theme.typography.sizes.medium;
    
    return {
      flex: 1,
      fontSize,
      color: disabled ? colors.textDisabled : colors.text,
      paddingVertical: Platform.OS === 'ios' ? 0 : theme.spacing.s1,
      ...theme.typography.styles.bodyMedium,
    };
  };
  
  // Animated label styles
  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      labelAnimation.value,
      [0, 1],
      [0, -24]
    );
    
    const scale = interpolate(
      labelAnimation.value,
      [0, 1],
      [1, 0.85]
    );
    
    const color = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [colors.textSecondary, colors.primary]
    );
    
    return {
      transform: [
        { translateY },
        { scale },
      ],
      color: error ? colors.error : success ? colors.success : color,
    };
  });
  
  // Animated container styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (variant !== 'outlined') return {};
    
    const borderWidth = interpolate(
      focusAnimation.value,
      [0, 1],
      [theme.borderWidth.thin, theme.borderWidth.medium]
    );
    
    return {
      borderWidth,
    };
  });
  
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && variant !== 'underlined' && (
        <Animated.Text style={[styles.label, labelStyle, animatedLabelStyle]}>
          {label}{required && ' *'}
        </Animated.Text>
      )}
      
      <AnimatedView style={[getContainerStyles(), animatedContainerStyle, styles.container]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        {label && variant === 'underlined' && (
          <Animated.Text style={[styles.floatingLabel, labelStyle, animatedLabelStyle]}>
            {label}{required && ' *'}
          </Animated.Text>
        )}
        
        <TextInput
          ref={inputRef}
          style={[getInputStyles(), inputStyle]}
          placeholder={isFocused || localValue ? '' : placeholder}
          placeholderTextColor={colors.textTertiary}
          value={localValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </AnimatedView>
      
      {(helperText || errorMessage || successMessage) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText,
          success && styles.successText,
          { color: error ? colors.error : success ? colors.success : colors.textSecondary }
        ]}>
          {errorMessage || successMessage || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.s4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    left: theme.spacing.s4,
    top: theme.spacing.s4,
    zIndex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: theme.spacing.s1,
    ...theme.typography.styles.label,
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    top: theme.spacing.s4,
    ...theme.typography.styles.label,
  },
  leftIcon: {
    marginRight: theme.spacing.component.iconSpacing,
  },
  rightIcon: {
    marginLeft: theme.spacing.component.iconSpacing,
  },
  helperText: {
    marginTop: theme.spacing.s1,
    marginLeft: theme.spacing.s4,
    ...theme.typography.styles.caption,
  },
  errorText: {
    fontWeight: theme.typography.weights.medium,
  },
  successText: {
    fontWeight: theme.typography.weights.medium,
  },
});

export default Input;