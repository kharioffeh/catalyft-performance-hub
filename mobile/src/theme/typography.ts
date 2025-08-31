/**
 * Catalyft Fitness App - Enhanced Typography System
 * Modern design system with consistent font scales
 */

import { Platform, TextStyle } from 'react-native';

// Font families
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font weights
export const fontWeights = {
  thin: '100' as TextStyle['fontWeight'],
  extraLight: '200' as TextStyle['fontWeight'],
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

// Enhanced typography scale as per requirements
export const typography = {
  h1: { 
    fontSize: 32, 
    fontWeight: '800' as TextStyle['fontWeight'], 
    letterSpacing: -0.5,
    lineHeight: 40
  },
  h2: { 
    fontSize: 24, 
    fontWeight: '700' as TextStyle['fontWeight'], 
    letterSpacing: -0.3,
    lineHeight: 32
  },
  h3: { 
    fontSize: 20, 
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28
  },
  body: { 
    fontSize: 16, 
    lineHeight: 24,
    fontWeight: '400' as TextStyle['fontWeight']
  },
  caption: { 
    fontSize: 14, 
    lineHeight: 20,
    fontWeight: '400' as TextStyle['fontWeight']
  },
  label: { 
    fontSize: 12, 
    fontWeight: '600' as TextStyle['fontWeight'], 
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 0.5
  },
  
  // Additional properties for screens
  sizes: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    display1: 56,
    display2: 48,
    display3: 40,
    large: 18,
    regular: 16,
    medium: 16,
    small: 14,
    button: 16,
  },
  weights: {
    thin: '100' as TextStyle['fontWeight'],
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
    extraBold: '800' as TextStyle['fontWeight'],
    black: '900' as TextStyle['fontWeight'],
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  }
};

// Legacy font sizes for backward compatibility
export const fontSizes = {
  // Display sizes
  display1: 56,
  display2: 48,
  display3: 40,

  // Heading sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,

  // Body sizes
  large: 18,
  medium: 16,
  regular: 14,
  small: 12,
  tiny: 10,

  // Special sizes
  button: 16,
  label: 14,
  caption: 12,
  overline: 10,
};

// Line heights
export const lineHeights = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
  double: 2,
};

// Letter spacing
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
};

// Enhanced text styles with new design system
export const textStyles = {
  // Headings
  h1: {
    ...typography.h1,
    fontFamily: fontFamilies.bold,
    color: '#2E2E2E', // textHeading color
  },
  h2: {
    ...typography.h2,
    fontFamily: fontFamilies.bold,
    color: '#2E2E2E', // textHeading color
  },
  h3: {
    ...typography.h3,
    fontFamily: fontFamilies.semibold,
    color: '#2E2E2E', // textHeading color
  },
  
  // Body text
  body: {
    ...typography.body,
    fontFamily: fontFamilies.regular,
    color: '#4F4F4F', // textBody color
  },
  
  // Captions and labels
  caption: {
    ...typography.caption,
    fontFamily: fontFamilies.regular,
    color: '#9E9E9E', // textMuted color
  },
  
  label: {
    ...typography.label,
    fontFamily: fontFamilies.semibold,
    color: '#4F4F4F', // textBody color
  },
  
  // Interactive elements
  button: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.semibold,
    color: '#FFFFFF',
    textAlign: 'center' as TextStyle['textAlign'],
  },
  
  link: {
    fontSize: 16,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#0057FF', // primaryBlue color
    textDecorationLine: 'underline' as TextStyle['textDecorationLine'],
  },
  
  // Form elements
  input: {
    fontSize: 16,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#2E2E2E', // textHeading color
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#4F4F4F', // textBody color
  },
  
  inputError: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#FF1744', // dangerRed color
  },
  
  // Status messages
  success: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#00C853', // primaryGreen color
  },
  
  warning: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#FF6B00', // accentOrange color
  },
  
  error: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#FF1744', // dangerRed color
  },
  
  // Navigation
  navTitle: {
    fontSize: 18,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.semibold,
    color: '#2E2E2E', // textHeading color
  },
  
  navSubtitle: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#9E9E9E', // textMuted color
  },
  
  // Cards and lists
  cardTitle: {
    fontSize: 18,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.semibold,
    color: '#2E2E2E', // textHeading color
  },
  
  cardSubtitle: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#4F4F4F', // textBody color
  },
  
  listItemTitle: {
    fontSize: 16,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#2E2E2E', // textHeading color
  },
  
  listItemSubtitle: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#4F4F4F', // textBody color
  },
  
  // Badges and tags
  badge: {
    fontSize: 12,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.semibold,
    color: '#FFFFFF',
    textAlign: 'center' as TextStyle['textAlign'],
  },
  
  tag: {
    fontSize: 12,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#4F4F4F', // textBody color
  },
  
  // Timestamps and metadata
  timestamp: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#9E9E9E', // textMuted color
  },
  
  metadata: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: '#9E9E9E', // textMuted color
  },
  
  // Code and technical text
  code: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.mono,
    color: '#2E2E2E', // textHeading color
    backgroundColor: '#F5F7FA', // surface color
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  // Quotes and highlights
  quote: {
    fontSize: 16,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: '#4F4F4F', // textBody color
    fontStyle: 'italic' as TextStyle['fontStyle'],
  },
  
  highlight: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.semibold,
    color: '#0057FF', // primaryBlue color
  },
};

// Text alignment
export const textAlign = {
  left: 'left' as const,
  center: 'center' as const,
  right: 'right' as const,
  justify: 'justify' as const,
};

// Text decoration
export const textDecoration = {
  none: 'none' as const,
  underline: 'underline' as const,
  lineThrough: 'line-through' as const,
  underlineLineThrough: 'underline line-through' as const,
};

// Text transform
export const textTransform = {
  none: 'none' as const,
  uppercase: 'uppercase' as const,
  lowercase: 'lowercase' as const,
  capitalize: 'capitalize' as const,
};