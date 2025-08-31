# Animated Navigation Components

This directory contains enhanced navigation components with smooth animations and modern design patterns for the Catalyft Fitness App.

## Components Overview

### 1. AnimatedTabBar
A basic animated tab bar component with smooth transitions and active indicators.

**Features:**
- Smooth spring animations using React Native Reanimated
- Active tab highlighting with animated indicators
- Customizable colors and styling
- Responsive design with proper touch feedback

**Props:**
```typescript
interface AnimatedTabBarProps {
  tabs: Tab[];
  currentTab: number;
  onTabPress: (index: number) => void;
}

interface Tab {
  name: string;
  icon: string;
  label: string;
}
```

**Usage:**
```tsx
import { AnimatedTabBar } from '../components/ui';

const tabs = [
  { name: 'Home', icon: 'home', label: 'Home' },
  { name: 'Training', icon: 'fitness', label: 'Training' },
  { name: 'Analytics', icon: 'trending-up', label: 'Analytics' },
];

<AnimatedTabBar
  tabs={tabs}
  currentTab={currentTab}
  onTabPress={setCurrentTab}
/>
```

### 2. AdvancedAnimatedTabBar
An enhanced version with additional features like badges, disabled states, and theme support.

**Features:**
- All features from AnimatedTabBar
- Badge support with animated scaling
- Disabled tab states
- Long press actions
- Light/Dark theme support
- Enhanced animations (rotation, scaling)

**Props:**
```typescript
interface AdvancedAnimatedTabBarProps {
  tabs: Tab[];
  currentTab: number;
  onTabPress: (index: number) => void;
  onTabLongPress?: (index: number) => void;
  showBadges?: boolean;
  theme?: 'light' | 'dark';
}

interface Tab {
  name: string;
  icon: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}
```

**Usage:**
```tsx
import { AdvancedAnimatedTabBar } from '../components/ui';

const advancedTabs = [
  { name: 'Home', icon: 'home', label: 'Home', badge: 0 },
  { name: 'Training', icon: 'fitness', label: 'Training', badge: 3 },
  { name: 'Profile', icon: 'user', label: 'Profile', badge: 1, disabled: true },
];

<AdvancedAnimatedTabBar
  tabs={advancedTabs}
  currentTab={currentTab}
  onTabPress={setCurrentTab}
  onTabLongPress={handleLongPress}
  showBadges={true}
  theme="light"
/>
```

### 3. TabBarDemo
A comprehensive demo component showcasing all features and configurations.

**Features:**
- Interactive examples of both tab bar components
- Live configuration controls
- Feature showcase
- Usage examples and code snippets

## Animation Details

### Spring Animations
- **Scale**: Active tabs scale to 1.1x with spring physics
- **TranslateY**: Active tabs move up by 4px with smooth transitions
- **Opacity**: Smooth opacity transitions between active/inactive states
- **Rotation**: Subtle rotation animation for active tabs

### Animation Parameters
```typescript
// Spring animations
withSpring(value, {
  damping: 15,      // Controls oscillation
  stiffness: 150,   // Controls speed
});

// Timing animations
withTiming(value, {
  duration: 200,    // Animation duration in ms
});
```

### Performance Optimizations
- Uses `useSharedValue` for optimal performance
- Animations run on the UI thread
- Efficient re-renders with `useAnimatedStyle`
- Proper cleanup and memory management

## Integration with React Navigation

### Basic Integration
```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AnimatedTabBar } from '../components/ui';

const Tab = createBottomTabNavigator();

function MainTabs() {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Training" component={TrainingScreen} />
      </Tab.Navigator>
      
      <AnimatedTabBar
        tabs={tabs}
        currentTab={currentTab}
        onTabPress={setCurrentTab}
      />
    </View>
  );
}
```

### Advanced Integration with History
```tsx
import { useTabNavigation } from '../hooks/useTabNavigation';

function MainTabs() {
  const { currentTab, navigateToTab, goToPreviousTab } = useTabNavigation({
    initialTab: 0,
    tabCount: 5,
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Navigation content */}
      <AdvancedAnimatedTabBar
        tabs={tabs}
        currentTab={currentTab}
        onTabPress={navigateToTab}
        onTabLongPress={handleLongPress}
      />
    </View>
  );
}
```

## Customization

### Colors and Themes
```typescript
// Light theme (default)
const lightColors = {
  background: '#FFFFFF',
  active: '#0057FF',
  inactive: '#9E9E9E',
  indicator: '#F8F9FF',
  border: '#F0F0F0',
};

// Dark theme
const darkColors = {
  background: '#1A1A1A',
  active: '#4A9EFF',
  inactive: '#666666',
  indicator: '#2A2A2A',
  border: '#333333',
};
```

### Styling
```typescript
const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
```

## Accessibility Features

- Proper touch targets (48x48 minimum)
- Clear visual indicators for active states
- Support for disabled states
- Long press actions for power users
- High contrast color schemes

## Browser Compatibility

- React Native 0.74+
- React Native Reanimated 3.10+
- Expo SDK 51+
- iOS 13+ / Android API 21+

## Performance Considerations

- Animations run on UI thread for 60fps
- Efficient memory usage with proper cleanup
- Optimized re-renders
- Smooth scrolling performance

## Troubleshooting

### Common Issues

1. **Animations not working**
   - Ensure React Native Reanimated is properly installed
   - Check that animations are enabled in development

2. **Performance issues**
   - Reduce animation complexity for older devices
   - Use `useCallback` for event handlers
   - Avoid unnecessary re-renders

3. **Styling conflicts**
   - Check for conflicting styles from parent components
   - Ensure proper z-index values
   - Verify shadow/elevation properties

### Debug Mode
Enable debug logging by setting:
```typescript
// In development
console.log('Tab navigation:', { currentTab, tabCount });
```

## Future Enhancements

- [ ] Gesture-based navigation
- [ ] Custom transition animations
- [ ] Accessibility improvements
- [ ] Performance monitoring
- [ ] Theme presets
- [ ] Animation presets

## Contributing

When contributing to these components:

1. Maintain animation performance
2. Add proper TypeScript types
3. Include accessibility features
4. Test on both iOS and Android
5. Update documentation
6. Add unit tests for new features

## License

This component library is part of the Catalyft Fitness App and follows the same licensing terms.