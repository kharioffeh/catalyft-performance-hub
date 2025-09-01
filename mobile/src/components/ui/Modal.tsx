/**
 * Catalyft Fitness App - Modal Component
 * Versatile modal with bottom sheet, center, and full screen variants
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal as RNModal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  runOnJS,
} from '../../utils/reanimated-mock';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ModalType = 'bottom-sheet' | 'center' | 'full';
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  
  // Content
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  
  // Appearance
  type?: ModalType;
  size?: ModalSize;
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  closeOnSwipeDown?: boolean;
  
  // Behavior
  animateOnMount?: boolean;
  keyboardAvoidingView?: boolean;
  scrollable?: boolean;
  
  // Style overrides
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  type = 'bottom-sheet',
  size = 'medium',
  showHandle = true,
  closeOnBackdrop = true,
  closeOnSwipeDown = true,
  animateOnMount = true,
  keyboardAvoidingView = true,
  scrollable = false,
  style,
  contentStyle,
  backdropStyle,
}) => {
  const colorScheme = 'light'; // Default to light mode for now
  const isDark = false; // Simplified logic
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  
  // Get modal height based on size
  const getModalHeight = (): number => {
    if (type === 'full') return SCREEN_HEIGHT;
    if (type === 'center') {
      switch (size) {
        case 'small': return SCREEN_HEIGHT * 0.3;
        case 'medium': return SCREEN_HEIGHT * 0.5;
        case 'large': return SCREEN_HEIGHT * 0.7;
        case 'full': return SCREEN_HEIGHT * 0.9;
        default: return SCREEN_HEIGHT * 0.5;
      }
    }
    // Bottom sheet
    switch (size) {
      case 'small': return SCREEN_HEIGHT * 0.3;
      case 'medium': return SCREEN_HEIGHT * 0.5;
      case 'large': return SCREEN_HEIGHT * 0.75;
      case 'full': return SCREEN_HEIGHT * 0.9;
      default: return SCREEN_HEIGHT * 0.5;
    }
  };
  
  const modalHeight = getModalHeight();
  
  // Show modal
  const show = useCallback(() => {
    'worklet';
    if (type === 'bottom-sheet') {
      translateY.value = withSpring(0, { tension: 100, friction: 8 });
    } else if (type === 'center') {
      scale.value = withSpring(1, { tension: 100, friction: 8 });
    }
    backdropOpacity.value = withTiming(1, { duration: 300 });
  }, [type, translateY, scale, backdropOpacity]);
  
  // Hide modal
  const hide = useCallback(() => {
    'worklet';
    if (type === 'bottom-sheet') {
      translateY.value = withSpring(modalHeight, { tension: 100, friction: 8 });
    } else if (type === 'center') {
      scale.value = withSpring(0.9, { tension: 100, friction: 8 });
    }
    backdropOpacity.value = withTiming(0, { duration: 200 });
    
    // Call onClose after animation
    setTimeout(() => {
      runOnJS(onClose)();
    }, 300);
  }, [type, translateY, scale, backdropOpacity, modalHeight, onClose]);
  
  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
              // HapticFeedback.trigger('impactLight'); // Removed for compatibility
      hide();
    }
  }, [closeOnBackdrop, hide]);
  
  // Pan gesture for bottom sheet
  const panGesture = Gesture.Pan()
    .enabled()
    .onUpdate((event: any) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event: any) => {
      if (event.translationY > 100) {
        onClose();
      } else {
        translateY.value = withSpring(0, { tension: 100, friction: 8 });
      }
    });
  
  // Effect to handle visibility
  useEffect(() => {
    if (visible) {
      show();
    } else {
      hide();
    }
  }, [visible, show, hide]);
  
  // Animated styles for backdrop
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    display: backdropOpacity.value > 0 ? 'flex' : 'none',
  }));
  
  // Animated styles for modal content
  const animatedModalStyle = useAnimatedStyle(() => {
    if (type === 'bottom-sheet') {
      return {
        transform: [{ translateY: translateY.value }],
      };
    } else if (type === 'center') {
      return {
        transform: [{ scale: scale.value }],
        opacity: interpolate(
          scale.value,
          [0.9, 1],
          [0, 1],
          Extrapolate.CLAMP
        ),
      };
    }
    return {};
  });
  
  // Get modal container styles
  const getModalStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: theme.borderRadius.modal,
      overflow: 'hidden',
    };
    
    if (type === 'bottom-sheet') {
      return {
        ...baseStyle,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: modalHeight,
        borderTopLeftRadius: theme.borderRadius.modal,
        borderTopRightRadius: theme.borderRadius.modal,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      };
    } else if (type === 'center') {
      return {
        ...baseStyle,
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        maxHeight: modalHeight,
        alignSelf: 'center',
      };
    } else {
      return {
        ...baseStyle,
        flex: 1,
        borderRadius: 0,
      };
    }
  };
  
  // Render modal content
  const renderContent = () => (
    <>
      {type === 'bottom-sheet' && showHandle && (
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
        </View>
      )}
      
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={hide} style={styles.closeButton}>
            <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {scrollable ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      )}
      
      {footer && (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {footer}
        </View>
      )}
    </>
  );
  
  if (!visible && !animateOnMount) return null;
  
  const ModalContent = (
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <AnimatedTouchable
        style={[styles.backdrop, animatedBackdropStyle, backdropStyle]}
        onPress={handleBackdropPress}
        activeOpacity={1}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[getModalStyles(), animatedModalStyle, style]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {renderContent()}
          </Animated.View>
        </GestureDetector>
      </AnimatedTouchable>
    </GestureHandlerRootView>
  );
  
  if (keyboardAvoidingView && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={StyleSheet.absoluteFillObject}>
        {ModalContent}
      </KeyboardAvoidingView>
    );
  }
  
  return ModalContent;
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: theme.borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.componentSpacing.modalPadding,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: theme.componentSpacing.modalPadding,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    padding: theme.componentSpacing.modalPadding,
    borderTopWidth: 1,
  },
});

export default Modal;