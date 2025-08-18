/**
 * Catalyft Fitness App - Modal Component
 * Versatile modal with bottom sheet, center, and full screen variants
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import HapticFeedback from 'react-native-haptic-feedback';
import { theme } from '../../theme';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
      translateY.value = withSpring(0, theme.animation.spring.standard);
    } else if (type === 'center') {
      scale.value = withSpring(1, theme.animation.spring.bouncy);
    }
    backdropOpacity.value = withTiming(1, theme.animation.timing.standard);
  }, [type, translateY, scale, backdropOpacity]);
  
  // Hide modal
  const hide = useCallback(() => {
    'worklet';
    if (type === 'bottom-sheet') {
      translateY.value = withSpring(modalHeight, theme.animation.spring.standard);
    } else if (type === 'center') {
      scale.value = withSpring(0.9, theme.animation.spring.standard);
    }
    backdropOpacity.value = withTiming(0, theme.animation.timing.fast);
    
    // Call onClose after animation
    setTimeout(() => {
      runOnJS(onClose)();
    }, theme.animation.duration.normal);
  }, [type, translateY, scale, backdropOpacity, modalHeight, onClose]);
  
  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      HapticFeedback.trigger('impactLight');
      hide();
    }
  }, [closeOnBackdrop, hide]);
  
  // Pan gesture for bottom sheet
  const panGesture = Gesture.Pan()
    .enabled(type === 'bottom-sheet' && closeOnSwipeDown)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > modalHeight * 0.2) {
        runOnJS(hide)();
      } else {
        translateY.value = withSpring(0, theme.animation.spring.standard);
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
    paddingVertical: theme.spacing.s2,
  },
  handle: {
    width: theme.dimensions.bottomSheetHandleWidth,
    height: theme.dimensions.bottomSheetHandle,
    borderRadius: theme.borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.component.modalPadding,
    paddingVertical: theme.spacing.s3,
    borderBottomWidth: theme.borderWidth.hairline,
  },
  title: {
    ...theme.typography.styles.h5,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.s2,
  },
  closeIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: theme.spacing.component.modalPadding,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    padding: theme.spacing.component.modalPadding,
    borderTopWidth: theme.borderWidth.hairline,
  },
});

export default Modal;