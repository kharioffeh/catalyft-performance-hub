/**
 * Catalyft Fitness App - Color System
 * Energetic colors for a fitness-focused experience
 */

export interface ColorPalette {
  // Primary - Energetic Blue
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;

  // Secondary - Vibrant Orange
  secondary50: string;
  secondary100: string;
  secondary200: string;
  secondary300: string;
  secondary400: string;
  secondary500: string;
  secondary600: string;
  secondary700: string;
  secondary800: string;
  secondary900: string;

  // Success - Fresh Green
  success50: string;
  success100: string;
  success200: string;
  success300: string;
  success400: string;
  success500: string;
  success600: string;
  success700: string;
  success800: string;
  success900: string;

  // Warning - Warm Yellow
  warning50: string;
  warning100: string;
  warning200: string;
  warning300: string;
  warning400: string;
  warning500: string;
  warning600: string;
  warning700: string;
  warning800: string;
  warning900: string;

  // Error - Alert Red
  error50: string;
  error100: string;
  error200: string;
  error300: string;
  error400: string;
  error500: string;
  error600: string;
  error700: string;
  error800: string;
  error900: string;

  // Neutral - Grays
  neutral50: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral400: string;
  neutral500: string;
  neutral600: string;
  neutral700: string;
  neutral800: string;
  neutral900: string;
  neutral950: string;
}

export const baseColors: ColorPalette = {
  // Primary - Energetic Blue
  primary50: '#EBF5FF',
  primary100: '#D1E9FF',
  primary200: '#A3D3FF',
  primary300: '#6BB6FF',
  primary400: '#2E96FF',
  primary500: '#0078FF', // Main brand color
  primary600: '#0063E6',
  primary700: '#004FC7',
  primary800: '#003D9E',
  primary900: '#002E7A',

  // Secondary - Vibrant Orange
  secondary50: '#FFF7ED',
  secondary100: '#FFEDD5',
  secondary200: '#FED7AA',
  secondary300: '#FDBA74',
  secondary400: '#FB923C',
  secondary500: '#F97316', // Energetic orange
  secondary600: '#EA580C',
  secondary700: '#C2410C',
  secondary800: '#9A3412',
  secondary900: '#7C2D12',

  // Success - Fresh Green
  success50: '#F0FDF4',
  success100: '#DCFCE7',
  success200: '#BBF7D0',
  success300: '#86EFAC',
  success400: '#4ADE80',
  success500: '#22C55E', // Achievement green
  success600: '#16A34A',
  success700: '#15803D',
  success800: '#166534',
  success900: '#14532D',

  // Warning - Warm Yellow
  warning50: '#FEFCE8',
  warning100: '#FEF9C3',
  warning200: '#FEF08A',
  warning300: '#FDE047',
  warning400: '#FACC15',
  warning500: '#EAB308', // Attention yellow
  warning600: '#CA8A04',
  warning700: '#A16207',
  warning800: '#854D0E',
  warning900: '#713F12',

  // Error - Alert Red
  error50: '#FEF2F2',
  error100: '#FEE2E2',
  error200: '#FECACA',
  error300: '#FCA5A5',
  error400: '#F87171',
  error500: '#EF4444', // Alert red
  error600: '#DC2626',
  error700: '#B91C1C',
  error800: '#991B1B',
  error900: '#7F1D1D',

  // Neutral - Grays
  neutral50: '#FAFAFA',
  neutral100: '#F4F4F5',
  neutral200: '#E4E4E7',
  neutral300: '#D4D4D8',
  neutral400: '#A1A1AA',
  neutral500: '#71717A',
  neutral600: '#52525B',
  neutral700: '#3F3F46',
  neutral800: '#27272A',
  neutral900: '#18181B',
  neutral950: '#09090B',
};

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  textOnPrimary: string;
  textOnSecondary: string;

  // Border colors
  border: string;
  borderLight: string;
  borderFocus: string;

  // Semantic colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;

  // Special colors
  overlay: string;
  shadow: string;
  highlight: string;
  link: string;
  linkVisited: string;

  // Fitness-specific colors
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  heartRate: string;
  workout: string;
  rest: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: baseColors.neutral50,
  backgroundTertiary: baseColors.neutral100,
  surface: '#FFFFFF',
  surfaceSecondary: baseColors.neutral50,
  surfaceElevated: '#FFFFFF',

  // Text colors
  text: baseColors.neutral900,
  textSecondary: baseColors.neutral700,
  textTertiary: baseColors.neutral500,
  textDisabled: baseColors.neutral400,
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Border colors
  border: baseColors.neutral200,
  borderLight: baseColors.neutral100,
  borderFocus: baseColors.primary500,

  // Semantic colors
  primary: baseColors.primary500,
  primaryLight: baseColors.primary400,
  primaryDark: baseColors.primary600,
  secondary: baseColors.secondary500,
  secondaryLight: baseColors.secondary400,
  secondaryDark: baseColors.secondary600,
  success: baseColors.success500,
  successLight: baseColors.success400,
  successDark: baseColors.success600,
  warning: baseColors.warning500,
  warningLight: baseColors.warning400,
  warningDark: baseColors.warning600,
  error: baseColors.error500,
  errorLight: baseColors.error400,
  errorDark: baseColors.error600,

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  highlight: baseColors.primary100,
  link: baseColors.primary500,
  linkVisited: baseColors.primary700,

  // Fitness-specific colors
  calories: baseColors.secondary500,
  protein: baseColors.primary500,
  carbs: baseColors.warning500,
  fat: baseColors.success500,
  heartRate: baseColors.error500,
  workout: baseColors.primary500,
  rest: baseColors.success500,
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: baseColors.neutral950,
  backgroundSecondary: baseColors.neutral900,
  backgroundTertiary: baseColors.neutral800,
  surface: baseColors.neutral900,
  surfaceSecondary: baseColors.neutral800,
  surfaceElevated: baseColors.neutral800,

  // Text colors
  text: baseColors.neutral50,
  textSecondary: baseColors.neutral200,
  textTertiary: baseColors.neutral400,
  textDisabled: baseColors.neutral600,
  textInverse: baseColors.neutral900,
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Border colors
  border: baseColors.neutral700,
  borderLight: baseColors.neutral800,
  borderFocus: baseColors.primary400,

  // Semantic colors
  primary: baseColors.primary400,
  primaryLight: baseColors.primary300,
  primaryDark: baseColors.primary500,
  secondary: baseColors.secondary400,
  secondaryLight: baseColors.secondary300,
  secondaryDark: baseColors.secondary500,
  success: baseColors.success400,
  successLight: baseColors.success300,
  successDark: baseColors.success500,
  warning: baseColors.warning400,
  warningLight: baseColors.warning300,
  warningDark: baseColors.warning500,
  error: baseColors.error400,
  errorLight: baseColors.error300,
  errorDark: baseColors.error500,

  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  highlight: baseColors.primary900,
  link: baseColors.primary400,
  linkVisited: baseColors.primary600,

  // Fitness-specific colors
  calories: baseColors.secondary400,
  protein: baseColors.primary400,
  carbs: baseColors.warning400,
  fat: baseColors.success400,
  heartRate: baseColors.error400,
  workout: baseColors.primary400,
  rest: baseColors.success400,
};

// Gradients for special UI elements
export const gradients = {
  primary: ['#0078FF', '#0063E6'],
  secondary: ['#F97316', '#EA580C'],
  success: ['#22C55E', '#16A34A'],
  sunset: ['#F97316', '#EF4444'],
  ocean: ['#0078FF', '#22C55E'],
  fire: ['#EF4444', '#F97316'],
  energy: ['#FACC15', '#F97316'],
  cool: ['#0078FF', '#A855F7'],
  dark: ['#27272A', '#09090B'],
  light: ['#FFFFFF', '#F4F4F5'],
};

// Opacity values for consistent transparency
export const opacity = {
  transparent: 0,
  barely: 0.05,
  faint: 0.1,
  light: 0.2,
  medium: 0.4,
  strong: 0.6,
  heavy: 0.8,
  almost: 0.95,
  opaque: 1,
};