/**
 * Catalyft Fitness App - Toast Component
 * Notification system for user feedback
 */

import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolate,
} from '../../utils/reanimated-mock';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom' | 'center';
export type ToastDuration = 'short' | 'long' | number;

export interface ToastConfig {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: ToastDuration;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  haptic?: boolean;
}

export interface ToastRef {
  show: (config: ToastConfig) => void;
  hide: () => void;
}

interface ToastProps {
  defaultPosition?: ToastPosition;
  defaultDuration?: ToastDuration;
  offsetTop?: number;
  offsetBottom?: number;
}

export const Toast = forwardRef<ToastRef, ToastProps>(({
  defaultPosition = 'bottom',
  defaultDuration = 'short',
  offsetTop = 0,
  offsetBottom = 0,
}, ref) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  const insets = useSafeAreaInsets();
  
  // State
  const [config, setConfig] = React.useState<ToastConfig | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Animation values
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  
  // Get duration in milliseconds
  const getDuration = (duration: ToastDuration = defaultDuration): number => {
    if (typeof duration === 'number') return duration;
    return duration === 'long' ? 4000 : 2000;
  };
  
  // Get toast colors based on type
  const getToastColors = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return {
          background: colors.success,
          text: colors.textOnPrimary,
          icon: '✓',
        };
      case 'error':
        return {
          background: colors.error,
          text: colors.textOnPrimary,
          icon: '✕',
        };
      case 'warning':
        return {
          background: colors.warning,
          text: isDark ? colors.textOnPrimary : colors.text,
          icon: '!',
        };
      case 'info':
      default:
        return {
          background: isDark ? colors.surfaceElevated : colors.text,
          text: isDark ? colors.text : colors.textInverse,
          icon: 'i',
        };
    }
  };
  
  // Show toast
  const show = useCallback((toastConfig: ToastConfig) => {
    setConfig(toastConfig);
    setIsVisible(true);
    
    // Haptic feedback
    if (toastConfig.haptic !== false) {
      const hapticType = toastConfig.type === 'error' ? 'notificationError' 
        : toastConfig.type === 'success' ? 'notificationSuccess'
        : 'impactLight';
      HapticFeedback.trigger(hapticType);
    }
    
    // Animate in
    const position = toastConfig.position || defaultPosition;
    if (position === 'top') {
      translateY.value = withSpring(-100, theme.animation.spring.bouncy);
      translateY.value = withSpring(0, theme.animation.spring.bouncy);
    } else if (position === 'bottom') {
      translateY.value = withSpring(100, theme.animation.spring.bouncy);
      translateY.value = withSpring(0, theme.animation.spring.bouncy);
    } else {
      scale.value = withSpring(1, theme.animation.spring.bouncy);
    }
    opacity.value = withTiming(1, theme.animation.timing.fast);
    
    // Auto hide
    const duration = getDuration(toastConfig.duration);
    const hideTimer = setTimeout(() => {
      hide();
    }, duration);
    
    return () => clearTimeout(hideTimer);
  }, [defaultPosition, translateY, scale, opacity]);
  
  // Hide toast
  const hide = useCallback(() => {
    const position = config?.position || defaultPosition;
    
    if (position === 'top') {
      translateY.value = withTiming(-100, theme.animation.timing.fast);
    } else if (position === 'bottom') {
      translateY.value = withTiming(100, theme.animation.timing.fast);
    } else {
      scale.value = withTiming(0.9, theme.animation.timing.fast);
    }
    opacity.value = withTiming(0, theme.animation.timing.fast);
    
    setTimeout(() => {
      setIsVisible(false);
      setConfig(null);
    }, theme.animation.duration.fast);
  }, [config, defaultPosition, translateY, scale, opacity]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    const position = config?.position || defaultPosition;
    
    if (position === 'center') {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    }
    
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });
  
  if (!isVisible || !config) return null;
  
  const position = config.position || defaultPosition;
  const toastColors = getToastColors(config.type);
  
  // Get position styles
  const getPositionStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      left: theme.spacing.s4,
      right: theme.spacing.s4,
      maxWidth: SCREEN_WIDTH - theme.spacing.s8,
      alignSelf: 'center',
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: insets.top + theme.spacing.s4 + offsetTop,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: insets.bottom + theme.spacing.s4 + offsetBottom,
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          top: '50%',
          marginTop: -30,
        };
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        { backgroundColor: toastColors.background },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.content}>
        {(config.icon || toastColors.icon) && (
          <View style={styles.iconContainer}>
            {config.icon || (
              <Text style={[styles.icon, { color: toastColors.text }]}>
                {toastColors.icon}
              </Text>
            )}
          </View>
        )}
        
        <Text style={[styles.message, { color: toastColors.text }]} numberOfLines={2}>
          {config.message}
        </Text>
        
        {config.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              config.action?.onPress();
              hide();
            }}
          >
            <Text style={[styles.actionLabel, { color: toastColors.text }]}>
              {config.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';

// Toast Manager for global usage
class ToastManager {
  private static instance: ToastRef | null = null;
  
  static setRef(ref: ToastRef | null) {
    this.instance = ref;
  }
  
  static show(config: ToastConfig) {
    this.instance?.show(config);
  }
  
  static hide() {
    this.instance?.hide();
  }
  
  static success(message: string, options?: Partial<ToastConfig>) {
    this.show({ ...options, message, type: 'success' });
  }
  
  static error(message: string, options?: Partial<ToastConfig>) {
    this.show({ ...options, message, type: 'error' });
  }
  
  static warning(message: string, options?: Partial<ToastConfig>) {
    this.show({ ...options, message, type: 'warning' });
  }
  
  static info(message: string, options?: Partial<ToastConfig>) {
    this.show({ ...options, message, type: 'info' });
  }
}

export { ToastManager };

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.s3,
  },
  icon: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  message: {
    flex: 1,
    ...theme.typography.styles.bodyMedium,
  },
  actionButton: {
    marginLeft: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s1,
  },
  actionLabel: {
    ...theme.typography.styles.button,
    fontSize: theme.typography.sizes.small,
  },
});

export default Toast;