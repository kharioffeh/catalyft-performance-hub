/**
 * Catalyft Fitness App - Theme Export
 * Central export for all theme configurations
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';

import { lightTheme, darkTheme, baseColors, gradients, opacity } from './colors';
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing, textStyles } from './typography';
import { spacing, componentSpacing, layoutSpacing, borderRadius, borderWidth, iconSize, avatarSize, zIndex, dimensions } from './spacing';
import { duration, easing, spring, timing, gesture, transitions, keyframes, animationUtils } from './animations';

// Combined theme object
export const theme = {
  colors: {
    light: lightTheme,
    dark: darkTheme,
    base: baseColors,
    gradients,
    opacity,
  },
  typography: {
    families: fontFamilies,
    sizes: fontSizes,
    weights: fontWeights,
    lineHeights,
    letterSpacing,
    styles: textStyles,
  },
  spacing: {
    ...spacing,
    component: componentSpacing,
    layout: layoutSpacing,
  },
  borderRadius,
  borderWidth,
  iconSize,
  avatarSize,
  zIndex,
  dimensions,
  animation: {
    duration,
    easing,
    spring,
    timing,
    gesture,
    transitions,
    keyframes,
    utils: animationUtils,
  },
};

export default theme;