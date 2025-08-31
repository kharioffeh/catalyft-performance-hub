/**
 * Catalyft Fitness App - Toast Component
 * Notification system for user feedback
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  
  // Animation values using regular Animated
  const translateY = React.useRef(new Animated.Value(100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.9)).current;
  
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
          background: colors.info,
          text: colors.textOnPrimary,
          icon: 'i',
        };
    }
  };
  
  // Show toast
  const show = React.useCallback((toastConfig: ToastConfig) => {
    setConfig(toastConfig);
    setIsVisible(true);
    
    // Animate in
    const position = toastConfig.position || defaultPosition;
    if (position === 'top') {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else if (position === 'bottom') {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Auto hide
    const duration = getDuration(toastConfig.duration);
    const hideTimer = setTimeout(() => {
      hide();
    }, duration);
    
    return () => clearTimeout(hideTimer);
  }, [defaultPosition, translateY, scale, opacity]);
  
  // Hide toast
  const hide = React.useCallback(() => {
    const position = config?.position || defaultPosition;
    
    if (position === 'top') {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (position === 'bottom') {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      setIsVisible(false);
      setConfig(null);
    }, 200);
  }, [config, defaultPosition, translateY, scale, opacity]);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));
  
  // Animated styles
  const animatedStyle = {
    opacity: opacity,
    transform: [
      ...(config?.position === 'center' ? [{ scale: scale }] : [{ translateY: translateY }]),
    ],
  };
  
  if (!isVisible || !config) return null;
  
  const position = config.position || defaultPosition;
  const toastColors = getToastColors(config.type);
  
  // Get position styles
  const getPositionStyles = (): any => {
    const baseStyle: any = {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      maxWidth: SCREEN_WIDTH - theme.spacing.xxl,
      alignSelf: 'center',
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: insets.top + theme.spacing.md + offsetTop,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: insets.bottom + theme.spacing.md + offsetBottom,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: theme.typography.sizes.h6,
    fontWeight: theme.typography.weights.bold,
  },
  message: {
    flex: 1,
    fontSize: theme.typography.sizes.h6,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
  },
  actionButton: {
    marginLeft: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.sizes.h6,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.textOnPrimary,
  },
});

export default Toast;