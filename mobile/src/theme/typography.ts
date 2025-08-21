/**
 * Catalyft Fitness App - Typography System
 * Consistent font scales and text styles
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

// Font sizes
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

// Text styles
export const textStyles = {
  // Display styles
  display1: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display1,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display1 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  display2: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display2,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display2 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  display3: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display3,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display3 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  // Heading styles
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.h1 * lineHeights.snug,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.h2 * lineHeights.snug,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  h3: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.h3 * lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h4: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.h4,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.h4 * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h5: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.h5,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.h5 * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  h6: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.h6,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.h6 * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.large,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.large * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.medium,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.medium * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodyRegular: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.regular * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.small,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.small * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Special styles
  button: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.button * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'none',
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.regular * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'none',
  } as TextStyle,

  label: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.label,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.label * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.caption * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  overline: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.overline,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.overline * lineHeights.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  } as TextStyle,

  link: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.regular * lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
    textDecorationLine: 'underline',
  } as TextStyle,

  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.regular,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.regular * lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  // Fitness-specific styles
  metric: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.h2 * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  } as TextStyle,

  metricLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.caption * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  } as TextStyle,

  timer: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.display3,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display3 * lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  } as TextStyle,

  counter: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.display1,
    fontWeight: fontWeights.black,
    lineHeight: fontSizes.display1 * lineHeights.tight,
    letterSpacing: letterSpacing.tighter,
  } as TextStyle,
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