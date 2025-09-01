import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
// Haptic feedback removed for compatibility
import Icon from './Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tab {
  name: string;
  icon: string;
  label: string;
}

interface AnimatedTabBarProps {
  tabs: Tab[];
  currentTab: number;
  onTabPress: (index: number) => void;
}

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  currentTab,
  onTabPress,
}) => {
  const animatedValues = useRef(
    tabs.map(() => ({
      scale: useSharedValue(1),
      opacity: useSharedValue(0.6),
      translateY: useSharedValue(0),
    }))
  ).current;

  const activeIndicatorPosition = useSharedValue(0);
  const activeIndicatorWidth = useSharedValue(0);

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
  }, [currentTab, tabs.length]);

  const getAnimatedStyle = (index: number) => {
    const value = animatedValues[index];
    
    return useAnimatedStyle(() => ({
      transform: [
        { scale: value.scale.value },
        { translateY: value.translateY.value },
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

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: activeIndicatorPosition.value },
    ],
    width: activeIndicatorWidth.value,
  }));

  const handleTabPress = (index: number) => {
    // Haptic feedback removed for compatibility
    
    // Call the parent handler
    onTabPress(index);
  };

  return (
    <View style={styles.tabBar}>
      {/* Active indicator background */}
      <Animated.View style={[styles.activeIndicatorBackground, activeIndicatorStyle]} />
      
      {tabs.map((tab, index) => {
        const isActive = currentTab === index;
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => handleTabPress(index)}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.iconContainer, getAnimatedStyle(index)]}>
              <Icon 
                name={tab.icon} 
                size={24} 
                color={isActive ? '#0057FF' : '#9E9E9E'}
              />
              {isActive && (
                <Animated.View style={styles.activeIndicator} />
              )}
            </Animated.View>
            <Animated.Text style={[styles.tabLabel, getLabelStyle(index)]}>
              {tab.label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    backgroundColor: '#0057FF',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E9E9E',
    textAlign: 'center',
  },
  activeIndicatorBackground: {
    position: 'absolute',
    top: 12,
    height: 48,
    backgroundColor: '#F8F9FF',
    borderRadius: 24,
    zIndex: -1,
  },
});

export default AnimatedTabBar;