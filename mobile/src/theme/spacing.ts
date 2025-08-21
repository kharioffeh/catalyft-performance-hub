/**
 * Catalyft Fitness App - Spacing System
 * Consistent spacing scale for layout and components
 */

// Base unit (4px)
const BASE_UNIT = 4;

// Spacing scale
export const spacing = {
  // Micro spacing
  xxs: BASE_UNIT * 0.5, // 2px
  xs: BASE_UNIT * 1,     // 4px
  sm: BASE_UNIT * 2,     // 8px
  md: BASE_UNIT * 3,     // 12px
  lg: BASE_UNIT * 4,     // 16px
  xl: BASE_UNIT * 5,     // 20px
  xxl: BASE_UNIT * 6,    // 24px
  xxxl: BASE_UNIT * 8,   // 32px
  
  // Layout spacing
  s0: 0,
  s1: BASE_UNIT * 1,     // 4px
  s2: BASE_UNIT * 2,     // 8px
  s3: BASE_UNIT * 3,     // 12px
  s4: BASE_UNIT * 4,     // 16px
  s5: BASE_UNIT * 5,     // 20px
  s6: BASE_UNIT * 6,     // 24px
  s7: BASE_UNIT * 7,     // 28px
  s8: BASE_UNIT * 8,     // 32px
  s9: BASE_UNIT * 9,     // 36px
  s10: BASE_UNIT * 10,   // 40px
  s11: BASE_UNIT * 11,   // 44px
  s12: BASE_UNIT * 12,   // 48px
  s14: BASE_UNIT * 14,   // 56px
  s16: BASE_UNIT * 16,   // 64px
  s20: BASE_UNIT * 20,   // 80px
  s24: BASE_UNIT * 24,   // 96px
  s28: BASE_UNIT * 28,   // 112px
  s32: BASE_UNIT * 32,   // 128px
  s36: BASE_UNIT * 36,   // 144px
  s40: BASE_UNIT * 40,   // 160px
  s44: BASE_UNIT * 44,   // 176px
  s48: BASE_UNIT * 48,   // 192px
  s52: BASE_UNIT * 52,   // 208px
  s56: BASE_UNIT * 56,   // 224px
  s60: BASE_UNIT * 60,   // 240px
  s64: BASE_UNIT * 64,   // 256px
  s72: BASE_UNIT * 72,   // 288px
  s80: BASE_UNIT * 80,   // 320px
  s96: BASE_UNIT * 96,   // 384px
};

// Component-specific spacing
export const componentSpacing = {
  // Button padding
  buttonPaddingHorizontal: spacing.s4,
  buttonPaddingVertical: spacing.s3,
  buttonPaddingHorizontalSmall: spacing.s3,
  buttonPaddingVerticalSmall: spacing.s2,
  buttonPaddingHorizontalLarge: spacing.s5,
  buttonPaddingVerticalLarge: spacing.s4,
  
  // Input padding
  inputPaddingHorizontal: spacing.s4,
  inputPaddingVertical: spacing.s3,
  inputPaddingHorizontalSmall: spacing.s3,
  inputPaddingVerticalSmall: spacing.s2,
  inputPaddingHorizontalLarge: spacing.s5,
  inputPaddingVerticalLarge: spacing.s4,
  
  // Card padding
  cardPadding: spacing.s4,
  cardPaddingSmall: spacing.s3,
  cardPaddingLarge: spacing.s5,
  
  // Modal padding
  modalPadding: spacing.s5,
  modalPaddingSmall: spacing.s4,
  modalPaddingLarge: spacing.s6,
  
  // List item spacing
  listItemPadding: spacing.s4,
  listItemSpacing: spacing.s2,
  listSectionSpacing: spacing.s6,
  
  // Icon spacing
  iconSpacing: spacing.s2,
  iconSpacingSmall: spacing.s1,
  iconSpacingLarge: spacing.s3,
  
  // Section spacing
  sectionSpacing: spacing.s8,
  sectionSpacingSmall: spacing.s6,
  sectionSpacingLarge: spacing.s10,
};

// Layout spacing
export const layoutSpacing = {
  // Screen padding
  screenPadding: spacing.s4,
  screenPaddingSmall: spacing.s3,
  screenPaddingLarge: spacing.s5,
  
  // Container padding
  containerPadding: spacing.s4,
  containerPaddingSmall: spacing.s3,
  containerPaddingLarge: spacing.s5,
  
  // Grid spacing
  gridGap: spacing.s4,
  gridGapSmall: spacing.s2,
  gridGapLarge: spacing.s6,
  
  // Stack spacing
  stackSpacing: spacing.s4,
  stackSpacingSmall: spacing.s2,
  stackSpacingLarge: spacing.s6,
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  full: 9999,
  
  // Component-specific
  button: 12,
  buttonSmall: 8,
  buttonLarge: 16,
  input: 12,
  card: 16,
  modal: 20,
  chip: 9999,
  avatar: 9999,
  badge: 9999,
};

// Border width
export const borderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 3,
  heavy: 4,
};

// Icon sizes
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

// Avatar sizes
export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  xxl: 64,
  xxxl: 80,
  huge: 96,
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  loading: 9999,
};

// Dimensions
export const dimensions = {
  // Minimum touch target
  minTouchTarget: 44,
  
  // Button heights
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,
  
  // Input heights
  inputHeight: 48,
  inputHeightSmall: 36,
  inputHeightLarge: 56,
  
  // Header height
  headerHeight: 56,
  headerHeightLarge: 64,
  
  // Tab bar height
  tabBarHeight: 56,
  
  // Bottom sheet
  bottomSheetHandle: 4,
  bottomSheetHandleWidth: 40,
  
  // Progress indicators
  progressBarHeight: 4,
  progressBarHeightSmall: 2,
  progressBarHeightLarge: 8,
  
  // Skeleton loader
  skeletonHeight: 12,
  skeletonRadius: 4,
};