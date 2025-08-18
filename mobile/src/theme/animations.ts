/**
 * Catalyft Fitness App - Animation System
 * Reusable animation configurations and utilities
 */

import { Easing } from 'react-native-reanimated';

// Animation durations (in milliseconds)
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000,
  
  // Specific animations
  fade: 200,
  slide: 300,
  bounce: 400,
  spring: 500,
  ripple: 600,
  
  // Micro-interactions
  tap: 100,
  hover: 150,
  focus: 200,
  
  // Page transitions
  pageEnter: 400,
  pageExit: 300,
  modalOpen: 350,
  modalClose: 250,
  
  // Fitness-specific
  timerTick: 100,
  counterIncrement: 200,
  progressFill: 800,
  heartBeat: 600,
};

// Easing functions
export const easing = {
  // Standard easings
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Quad easings
  easeInQuad: Easing.in(Easing.quad),
  easeOutQuad: Easing.out(Easing.quad),
  easeInOutQuad: Easing.inOut(Easing.quad),
  
  // Cubic easings
  easeInCubic: Easing.in(Easing.cubic),
  easeOutCubic: Easing.out(Easing.cubic),
  easeInOutCubic: Easing.inOut(Easing.cubic),
  
  // Expo easings
  easeInExpo: Easing.in(Easing.exp),
  easeOutExpo: Easing.out(Easing.exp),
  easeInOutExpo: Easing.inOut(Easing.exp),
  
  // Back easings (with overshoot)
  easeInBack: Easing.in(Easing.back(1.7)),
  easeOutBack: Easing.out(Easing.back(1.7)),
  easeInOutBack: Easing.inOut(Easing.back(1.7)),
  
  // Elastic easings
  easeInElastic: Easing.in(Easing.elastic(1)),
  easeOutElastic: Easing.out(Easing.elastic(1)),
  easeInOutElastic: Easing.inOut(Easing.elastic(1)),
  
  // Bounce easings
  easeInBounce: Easing.in(Easing.bounce),
  easeOutBounce: Easing.out(Easing.bounce),
  easeInOutBounce: Easing.inOut(Easing.bounce),
  
  // Custom bezier curves
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
  snappy: Easing.bezier(0.4, 0, 0.6, 1),
  gentle: Easing.bezier(0.4, 0, 0.1, 1),
  energetic: Easing.bezier(0.68, -0.55, 0.265, 1.55),
};

// Spring configurations
export const spring = {
  // Gentle spring
  gentle: {
    damping: 15,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  
  // Standard spring
  standard: {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  
  // Snappy spring
  snappy: {
    damping: 20,
    mass: 0.8,
    stiffness: 200,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  
  // Bouncy spring
  bouncy: {
    damping: 8,
    mass: 0.8,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  
  // Stiff spring (minimal bounce)
  stiff: {
    damping: 30,
    mass: 1,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
  
  // No wobble (critically damped)
  noWobble: {
    damping: 26,
    mass: 1,
    stiffness: 170,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  },
};

// Timing configurations
export const timing = {
  // Fast timing
  fast: {
    duration: duration.fast,
    easing: easing.easeOutCubic,
  },
  
  // Standard timing
  standard: {
    duration: duration.normal,
    easing: easing.smooth,
  },
  
  // Smooth timing
  smooth: {
    duration: duration.slow,
    easing: easing.smooth,
  },
  
  // Energetic timing
  energetic: {
    duration: duration.normal,
    easing: easing.energetic,
  },
  
  // Gentle timing
  gentle: {
    duration: duration.slow,
    easing: easing.gentle,
  },
};

// Gesture animations
export const gesture = {
  // Tap animation
  tap: {
    scale: 0.95,
    duration: duration.tap,
    easing: easing.easeOutCubic,
  },
  
  // Press animation
  press: {
    scale: 0.9,
    duration: duration.hover,
    easing: easing.easeOutCubic,
  },
  
  // Swipe animation
  swipe: {
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  
  // Drag animation
  drag: {
    duration: 0,
    easing: easing.linear,
  },
  
  // Pinch animation
  pinch: {
    duration: 0,
    easing: easing.linear,
  },
};

// Transition presets
export const transitions = {
  // Fade transition
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: duration.fade,
    easing: easing.ease,
  },
  
  // Slide from bottom
  slideUp: {
    from: { translateY: 100 },
    to: { translateY: 0 },
    duration: duration.slide,
    easing: easing.easeOutCubic,
  },
  
  // Slide from top
  slideDown: {
    from: { translateY: -100 },
    to: { translateY: 0 },
    duration: duration.slide,
    easing: easing.easeOutCubic,
  },
  
  // Slide from left
  slideLeft: {
    from: { translateX: 100 },
    to: { translateX: 0 },
    duration: duration.slide,
    easing: easing.easeOutCubic,
  },
  
  // Slide from right
  slideRight: {
    from: { translateX: -100 },
    to: { translateX: 0 },
    duration: duration.slide,
    easing: easing.easeOutCubic,
  },
  
  // Scale transition
  scale: {
    from: { scale: 0 },
    to: { scale: 1 },
    duration: duration.bounce,
    easing: easing.easeOutBack,
  },
  
  // Zoom transition
  zoom: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  
  // Flip transition
  flip: {
    from: { rotateY: '90deg' },
    to: { rotateY: '0deg' },
    duration: duration.normal,
    easing: easing.easeOutCubic,
  },
  
  // Bounce transition
  bounce: {
    from: { translateY: -30 },
    to: { translateY: 0 },
    duration: duration.bounce,
    easing: easing.easeOutBounce,
  },
};

// Keyframe animations
export const keyframes = {
  // Pulse animation
  pulse: [
    { scale: 1, opacity: 1 },
    { scale: 1.05, opacity: 0.8 },
    { scale: 1, opacity: 1 },
  ],
  
  // Shake animation
  shake: [
    { translateX: 0 },
    { translateX: -10 },
    { translateX: 10 },
    { translateX: -10 },
    { translateX: 10 },
    { translateX: 0 },
  ],
  
  // Wiggle animation
  wiggle: [
    { rotate: '0deg' },
    { rotate: '-3deg' },
    { rotate: '3deg' },
    { rotate: '-3deg' },
    { rotate: '3deg' },
    { rotate: '0deg' },
  ],
  
  // Heartbeat animation
  heartbeat: [
    { scale: 1 },
    { scale: 1.1 },
    { scale: 1 },
    { scale: 1.15 },
    { scale: 1 },
  ],
  
  // Blink animation
  blink: [
    { opacity: 1 },
    { opacity: 0 },
    { opacity: 1 },
  ],
  
  // Float animation
  float: [
    { translateY: 0 },
    { translateY: -10 },
    { translateY: 0 },
  ],
  
  // Spin animation
  spin: [
    { rotate: '0deg' },
    { rotate: '360deg' },
  ],
};

// Animation utilities
export const animationUtils = {
  // Create a delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Stagger animations
  stagger: (delay: number, index: number) => delay * index,
  
  // Loop animation
  loop: (iterations: number = -1) => ({
    iterations,
    reverse: true,
  }),
  
  // Sequence animations
  sequence: (animations: any[]) => animations,
  
  // Parallel animations
  parallel: (animations: any[]) => animations,
};