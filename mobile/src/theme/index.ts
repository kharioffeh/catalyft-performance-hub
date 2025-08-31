/**
 * Catalyft Fitness App - Enhanced Theme System
 * Modern design system with light/dark mode support
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './animations';

// Enhanced theme configuration
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { componentSpacing } from './spacing';

// Main theme object with new design system
export const theme = {
  colors,
  spacing,
  typography,
  componentSpacing,
  gradients: {
    primary: ['#0057FF', '#4A9EFF'],
    secondary: ['#FF6B00', '#FF8A65'],
    success: ['#00C853', '#4CAF50'],
    workout: ['#FF6B00', '#FF8A65'],
    warning: ['#FF9800', '#FFB74D'],
    rest: ['#9C27B0', '#BA68C8']
  },
  
  // Border radius system
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
    
    // Component-specific border radius
    button: 12,
    input: 12,
    card: 16,
    modal: 20,
    avatar: 50,
    badge: 12,
    chip: 16,
    progress: 4,
  },
  
  // Shadow system
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 16,
    },
  },
  
  // Z-index system
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Animation system
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 700,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },
  
  // Breakpoint system for responsive design
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
  },
};

// Legacy theme support for backward compatibility
export const legacyTheme = {
  colors: {
    light: {
      primary: colors.light.brand.primaryBlue,
      secondary: colors.light.brand.accentOrange,
      success: colors.light.brand.primaryGreen,
      error: colors.light.brand.dangerRed,
      background: colors.light.neutral.background,
      surface: colors.light.neutral.surface,
      text: colors.light.neutral.textBody,
      textMuted: colors.light.neutral.textMuted,
      border: colors.light.neutral.border,
    },
    dark: {
      primary: colors.dark.brand.primaryBlue,
      secondary: colors.dark.brand.accentOrange,
      success: colors.dark.brand.primaryGreen,
      error: colors.dark.brand.dangerRed,
      background: colors.dark.neutral.background,
      surface: colors.dark.neutral.surface,
      text: colors.dark.neutral.textBody,
      textMuted: colors.dark.neutral.textMuted,
      border: colors.dark.neutral.border,
    },
  },
  spacing,
  typography,
  componentSpacing,
};

// Export both for flexibility
export default theme;