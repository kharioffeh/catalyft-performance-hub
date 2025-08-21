// Mock implementation of react-native-reanimated for CI/production
// This provides basic functionality without the native dependency

import { useRef, useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

// Mock Extrapolate enum
export enum Extrapolate {
  EXTEND = 'extend',
  CLAMP = 'clamp',
  IDENTITY = 'identity',
}

// Mock shared value
export const useSharedValue = (initialValue: any) => {
  const ref = useRef(new Animated.Value(initialValue));
  return {
    value: initialValue,
    ...ref.current,
  };
};

// Mock animated style
export const useAnimatedStyle = (updater: () => any) => {
  return updater();
};

// Mock animated props
export const useAnimatedProps = (updater: () => any) => {
  return updater();
};

// Mock interpolate
export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate?: string
) => {
  // Simple linear interpolation
  if (inputRange.length !== outputRange.length) {
    return outputRange[0];
  }
  
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const ratio = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + ratio * (outputRange[i + 1] - outputRange[i]);
    }
  }
  
  return value < inputRange[0] ? outputRange[0] : outputRange[outputRange.length - 1];
};

// Mock interpolateColor
export const interpolateColor = (
  value: number,
  inputRange: number[],
  outputRange: string[]
) => {
  // Return first or last color based on value
  if (value <= inputRange[0]) return outputRange[0];
  if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
  
  // Find the appropriate color
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      return outputRange[i];
    }
  }
  
  return outputRange[0];
};

// Mock timing animation
export const withTiming = (toValue: number, config?: any) => {
  return toValue;
};

// Mock spring animation
export const withSpring = (toValue: number, config?: any) => {
  return toValue;
};

// Mock sequence
export const withSequence = (...animations: any[]) => {
  return animations[animations.length - 1];
};

// Mock repeat
export const withRepeat = (animation: any, numberOfReps?: number, reverse?: boolean) => {
  return animation;
};

// Mock delay
export const withDelay = (delayMs: number, animation: any) => {
  return animation;
};

// Mock decay
export const withDecay = (config?: any) => {
  return 0;
};

// Mock runOnJS
export const runOnJS = (fn: Function) => {
  return fn;
};

// Mock runOnUI
export const runOnUI = (fn: Function) => {
  return fn;
};

// Mock cancelAnimation
export const cancelAnimation = (value: any) => {
  // No-op
};

// Export Animated components using React Native's Animated
export default {
  View: Animated.View,
  Text: Animated.Text,
  Image: Animated.Image,
  ScrollView: Animated.ScrollView,
  FlatList: Animated.FlatList,
  createAnimatedComponent: Animated.createAnimatedComponent,
};

// Export Easing from React Native
export { Easing };

// Mock gesture handler
export const Gesture = {
  Pan: () => ({ enabled: () => {} }),
  Tap: () => ({ enabled: () => {} }),
  Pinch: () => ({ enabled: () => {} }),
  Rotation: () => ({ enabled: () => {} }),
  Fling: () => ({ enabled: () => {} }),
  LongPress: () => ({ enabled: () => {} }),
  ForceTouch: () => ({ enabled: () => {} }),
};

export const GestureDetector = ({ children }: any) => children;