import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import Icon from './Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tab {
  name: string;
  icon: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}

interface AdvancedAnimatedTabBarProps {
  tabs: Tab[];
  currentTab: number;
  onTabPress: (index: number) => void;
  onTabLongPress?: (index: number) => void;
  showBadges?: boolean;
  theme?: 'light' | 'dark';
}

const AdvancedAnimatedTabBar: React.FC<AdvancedAnimatedTabBarProps> = ({
  tabs,
  currentTab,
  onTabPress,
  onTabLongPress,
  showBadges = true,
  theme = 'light',
}) => {
  const animatedValues = useRef(
    tabs.map(() => ({
      scale: useSharedValue(1),
      opacity: useSharedValue(0.6),
      translateY: useSharedValue(0),
      rotation: useSharedValue(0),
      badgeScale: useSharedValue(0),
    }))
  ).current;

  const activeIndicatorPosition = useSharedValue(0);
  const activeIndicatorWidth = useSharedValue(0);
  const activeIndicatorOpacity = useSharedValue(0);

  // Theme colors
  const colors = theme === 'light' ? {
    background: '#FFFFFF',
    active: '#0057FF',
    inactive: '#9E9E9E',
    indicator: '#F8F9FF',
    border: '#F0F0F0',
    text: '#333333',
  } : {
    background: '#1A1A1A',
    active: '#4A9EFF',
    inactive: '#666666',
    indicator: '#2A2A2A',
    border: '#333333',
    text: '#FFFFFF',
  };

  useEffect(() => {
    // Animate active tab
    animatedValues.forEach((value, index) => {
      const isActive = index === currentTab;
      
      value.scale.value = withSpring(isActive ? 1.1 : 1, {
        damping: 15,
        stiffness: 150,
      });
      
      value.opacity.value = withTiming(isActive ? 1 : 0.6, {
        duration: 200,
      });
      
      value.translateY.value = withSpring(isActive ? -4 : 0, {
        damping: 15,
        stiffness: 150,
      });

      // Add rotation animation for active tab
      value.rotation.value = withSpring(isActive ? 0.1 : 0, {
        damping: 20,
        stiffness: 200,
      });
    });

    // Animate active indicator
    const tabWidth = SCREEN_WIDTH / tabs.length;
    activeIndicatorPosition.value = withSpring(currentTab * tabWidth, {
      damping: 15,
      stiffness: 150,
    });
    
    activeIndicatorWidth.value = withSpring(tabWidth * 0.6, {
      damping: 15,
      stiffness: 150,
    });

    // Fade in indicator
    activeIndicatorOpacity.value = withTiming(1, { duration: 300 });
  }, [currentTab, tabs.length]);

  // Animate badges
  useEffect(() => {
    tabs.forEach((tab, index) => {
      if (tab.badge && tab.badge > 0) {
        animatedValues[index].badgeScale.value = withSpring(1, {
          damping: 10,
          stiffness: 200,
        });
      } else {
        animatedValues[index].badgeScale.value = withSpring(0, {
          damping: 10,
          stiffness: 200,
        });
      }
    });
  }, [tabs]);

  const getAnimatedStyle = (index: number) => {
    const value = animatedValues[index];
    
    return useAnimatedStyle(() => ({
      transform: [
        { scale: value.scale.value },
        { translateY: value.translateY.value },
        { rotate: `${value.rotation.value}rad` },
      ],
      opacity: value.opacity.value,
    }));
  };

  const getLabelStyle = (index: number) => {
    const value = animatedValues[index];
    
    return useAnimatedStyle(() => ({
      opacity: value.opacity.value,
      transform: [
        { scale: interpolate(value.scale.value, [1, 1.1], [1, 1.05]) },
      ],
    }));
  };

  const getBadgeStyle = (index: number) => {
    const value = animatedValues[index];
    
    return useAnimatedStyle(() => ({
      transform: [{ scale: value.badgeScale.value }],
      opacity: value.badgeScale.value,
    }));
  };

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: activeIndicatorPosition.value },
    ],
    width: activeIndicatorWidth.value,
    opacity: activeIndicatorOpacity.value,
  }));

  const handleTabPress = useCallback((index: number) => {
    onTabPress(index);
  }, [onTabPress]);

  const handleTabLongPress = useCallback((index: number) => {
    if (onTabLongPress) {
      onTabLongPress(index);
    }
  }, [onTabLongPress]);

  const renderBadge = (tab: Tab, index: number) => {
    if (!showBadges || !tab.badge || tab.badge <= 0) return null;

    return (
      <Animated.View style={[styles.badge, getBadgeStyle(index)]}>
        <Text style={[styles.badgeText, { color: colors.background }]}>
          {tab.badge > 99 ? '99+' : tab.badge}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Active indicator background */}
      <Animated.View 
        style={[
          styles.activeIndicatorBackground, 
          { backgroundColor: colors.indicator },
          activeIndicatorStyle
        ]} 
      />
      
      {tabs.map((tab, index) => {
        const isActive = currentTab === index;
        const isDisabled = tab.disabled;
        
        return (
          <Pressable
            key={tab.name}
            style={[styles.tabItem, isDisabled && styles.disabledTab]}
            onPress={() => !isDisabled && handleTabPress(index)}
            onLongPress={() => !isDisabled && handleTabLongPress(index)}
            disabled={isDisabled}
          >
            <Animated.View style={[styles.iconContainer, getAnimatedStyle(index)]}>
              <Icon 
                name={tab.icon} 
                size={24} 
                color={isActive ? colors.active : (isDisabled ? colors.border : colors.inactive)}
              />
              {isActive && (
                <Animated.View style={[styles.activeIndicator, { backgroundColor: colors.active }]} />
              )}
              {renderBadge(tab, index)}
            </Animated.View>
            <Animated.Text 
              style={[
                styles.tabLabel, 
                { color: isActive ? colors.active : (isDisabled ? colors.border : colors.inactive) },
                getLabelStyle(index)
              ]}
            >
              {tab.label}
            </Animated.Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 20,
    height: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  disabledTab: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIndicatorBackground: {
    position: 'absolute',
    top: 12,
    height: 48,
    borderRadius: 24,
    zIndex: -1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AdvancedAnimatedTabBar;