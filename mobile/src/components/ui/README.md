# CataLyft Enhanced Design System

A modern, comprehensive design system for React Native with light/dark mode support, smooth animations, and consistent theming.

## 🎨 Design Philosophy

- **Consistency**: Unified design language across all components
- **Accessibility**: WCAG compliant with proper contrast ratios and touch targets
- **Performance**: 60fps animations using React Native Reanimated 2
- **Flexibility**: Customizable components with sensible defaults
- **Modern**: Contemporary design patterns with gradient support and glass effects

## 🚀 Quick Start

```tsx
import { Button, Card, Input, CircularProgress, ProgressBar } from './components/ui';

// Use components with the new design system
<Button variant="primary" size="lg" onPress={handlePress}>
  Get Started
</Button>
```

## 🎯 Core Components

### Button
Enhanced button component with gradient support, multiple variants, and smooth animations.

```tsx
<Button
  variant="primary"        // primary | secondary | outline | ghost
  size="md"               // sm | md | lg | xl
  loading={false}         // Show loading spinner
  disabled={false}        // Disable interaction
  icon={<Icon />}         // Left or right icon
  onPress={handlePress}   // Press handler
>
  Button Text
</Button>
```

**Features:**
- Primary variant with blue gradient (`#0057FF` to `#003FCC`)
- Haptic feedback on press
- Scale animation (0.98) on press
- Loading state with spinner
- Icon support (left/right positioning)
- Multiple sizes: sm (40px), md (48px), lg (56px), xl (64px)

### Card
Flexible container with elevation, borders, and glass effects.

```tsx
<Card
  variant="elevated"      // elevated | outlined | glass
  size="medium"           // small | medium | large
  onPress={handlePress}   // Optional press handler
>
  Card content
</Card>
```

**Features:**
- Elevated variant with shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Glass variant with blur effect using expo-blur
- Press animation with scale transform
- Border radius: 16px
- Haptic feedback on press

### Input
Enhanced input field with floating labels and state management.

```tsx
<Input
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  size="md"               // sm | md | lg
  error="Invalid email"   // Error state
  success={true}          // Success state
  clearable={true}        // Show clear button
  leftIcon={<Icon />}     // Left icon
  rightIcon={<Icon />}    // Right icon
/>
```

**Features:**
- Floating label animation
- Focus state: border color `#0057FF`
- Error state: border color `#FF1744` with shake animation
- Success state: border color `#00C853` with checkmark
- Clear button when text is present
- Minimum height: 56px
- Icon support (left/right)

### CircularProgress
Animated circular progress indicator with gradient support.

```tsx
<CircularProgress
  progress={0.75}         // 0 to 1
  size="md"               // sm | md | lg
  strokeWidth={4}         // Stroke thickness
  strokeGradient={['#0057FF', '#00C853']}  // Optional gradient
  label="Progress"        // Center label
  showPercentage={true}   // Show percentage
/>
```

**Features:**
- Animated fill with Reanimated 2
- Gradient stroke support
- Center label/icon/percentage
- Size variants: sm (48px), md (64px), lg (80px)
- Smooth spring animations

### ProgressBar
Horizontal progress bar with gradient fill and labels.

```tsx
<ProgressBar
  progress={0.6}          // 0 to 1
  height={8}              // Bar height
  showLabel={true}        // Show label
  showValue={true}        // Show value
  label="Upload Progress"
  progressGradient={['#0057FF', '#00C853']}  // Optional gradient
/>
```

**Features:**
- Horizontal progress with customizable height
- Gradient fill support
- Animated value changes
- Height: 8px, Border radius: 4px
- Label and value display options

## 🎨 Theme System

### Colors
Modern color palette with light/dark mode support.

```tsx
import { theme } from './theme';

const colors = theme.colors.light; // or theme.colors.dark

// Brand colors
colors.brand.primaryBlue    // #0057FF
colors.brand.primaryGreen   // #00C853
colors.brand.accentOrange   // #FF6B00
colors.brand.dangerRed      // #FF1744

// Neutral colors
colors.neutral.background   // #FFFFFF / #121212
colors.neutral.surface      // #F5F7FA / #1E1E1E
colors.neutral.textHeading  // #2E2E2E / #FFFFFF
colors.neutral.textBody     // #4F4F4F / #E0E0E0
```

### Typography
Consistent typography scale with proper line heights and letter spacing.

```tsx
import { theme } from './theme';

const typography = theme.typography;

// Typography styles
typography.h1      // 32px, 800 weight, -0.5 letter spacing
typography.h2      // 24px, 700 weight, -0.3 letter spacing
typography.h3      // 20px, 600 weight
typography.body    // 16px, 400 weight, 24px line height
typography.caption // 14px, 400 weight, 20px line height
typography.label   // 12px, 600 weight, uppercase
```

### Spacing
Consistent spacing scale based on 4px grid.

```tsx
import { theme } from './theme';

const spacing = theme.spacing;

spacing.xs   // 4px
spacing.sm   // 8px
spacing.md   // 16px
spacing.lg   // 24px
spacing.xl   // 32px
spacing.xxl  // 48px
```

## 🔧 Installation

The design system uses these dependencies:

```bash
npm install react-native-reanimated react-native-svg expo-linear-gradient expo-blur react-native-haptic-feedback
```

## 📱 Demo

Use the `DesignSystemDemo` component to see all components in action:

```tsx
import { DesignSystemDemo } from './components/ui';

// In your app
<DesignSystemDemo />
```

## 🎭 Animation System

All animations use React Native Reanimated 2 for 60fps performance:

- **Spring animations**: Natural, bouncy movements
- **Timing animations**: Smooth, controlled transitions
- **Haptic feedback**: Tactile response for interactions
- **Press animations**: Scale transforms on touch

## 🌓 Dark Mode Support

All components automatically adapt to light/dark mode:

```tsx
import { useColorScheme } from 'react-native';
import { theme } from './theme';

const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? theme.colors.dark : theme.colors.light;
```

## ♿ Accessibility

- Proper contrast ratios for all color combinations
- Touch targets meet minimum 44px requirements
- Screen reader support with accessibility labels
- Haptic feedback for better user experience

## 🔄 Migration Guide

### From Legacy Components

1. **Button**: Update variant names and size props
2. **Card**: Use new variant system (elevated, outlined, glass)
3. **Input**: Implement floating label pattern
4. **Theme**: Use new color and typography system

### Breaking Changes

- Button variants: `success`, `warning`, `error` → `primary`, `secondary`, `outline`, `ghost`
- Button sizes: `small`, `medium`, `large` → `sm`, `md`, `lg`, `xl`
- Card variants: `filled`, `ghost` → `elevated`, `outlined`, `glass`

## 🧪 Testing

Components are tested with:

- TypeScript strict mode
- Jest unit tests
- React Native Testing Library
- Accessibility testing

## 📚 API Reference

See individual component files for detailed prop interfaces and examples.

## 🤝 Contributing

1. Follow the existing design patterns
2. Maintain TypeScript strict mode
3. Add proper accessibility labels
4. Include animation states
5. Support light/dark mode
6. Add comprehensive documentation

## 📄 License

This design system is part of the CataLyft fitness application.