import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import AnimatedTabBar from './AnimatedTabBar';
import AdvancedAnimatedTabBar from './AdvancedAnimatedTabBar';

const TabBarDemo: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showBadges, setShowBadges] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Basic tab configuration
  const basicTabs = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'Training', icon: 'fitness', label: 'Training' },
    { name: 'Analytics', icon: 'trending-up', label: 'Analytics' },
    { name: 'Nutrition', icon: 'scale', label: 'Nutrition' },
    { name: 'Profile', icon: 'user', label: 'Profile' },
  ];

  // Advanced tab configuration with badges and disabled state
  const advancedTabs = [
    { name: 'Home', icon: 'home', label: 'Home', badge: 0 },
    { name: 'Training', icon: 'fitness', label: 'Training', badge: 3 },
    { name: 'Analytics', icon: 'trending-up', label: 'Analytics', badge: 12 },
    { name: 'Nutrition', icon: 'scale', label: 'Nutrition', badge: 0 },
    { name: 'Profile', icon: 'user', label: 'Profile', badge: 1, disabled: true },
  ];

  const handleTabPress = (index: number) => {
    setCurrentTab(index);
  };

  const handleTabLongPress = (index: number) => {
    console.log(`Long pressed tab ${index}: ${advancedTabs[index].name}`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Animated Tab Bar Demo</Text>
      
      {/* Basic Animated Tab Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Animated Tab Bar</Text>
        <Text style={styles.description}>
          Simple animated tab bar with smooth transitions and active indicators.
        </Text>
        <View style={styles.tabBarContainer}>
          <AnimatedTabBar
            tabs={basicTabs}
            currentTab={currentTab}
            onTabPress={handleTabPress}
          />
        </View>
        <Text style={styles.currentTab}>
          Current Tab: {basicTabs[currentTab].name}
        </Text>
      </View>

      {/* Advanced Animated Tab Bar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Animated Tab Bar</Text>
        <Text style={styles.description}>
          Advanced features including badges, disabled states, long press actions, and theme support.
        </Text>
        
        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.control}>
            <Text style={styles.controlLabel}>Show Badges</Text>
            <Switch
              value={showBadges}
              onValueChange={setShowBadges}
              trackColor={{ false: '#767577', true: '#0057FF' }}
              thumbColor={showBadges ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.control}>
            <Text style={styles.controlLabel}>Dark Theme</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#0057FF' }}
              thumbColor={theme === 'dark' ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.tabBarContainer}>
          <AdvancedAnimatedTabBar
            tabs={advancedTabs}
            currentTab={currentTab}
            onTabPress={handleTabPress}
            onTabLongPress={handleTabLongPress}
            showBadges={showBadges}
            theme={theme}
          />
        </View>
        
        <Text style={styles.currentTab}>
          Current Tab: {advancedTabs[currentTab].name}
        </Text>
        
        {advancedTabs[currentTab].badge && advancedTabs[currentTab].badge > 0 && (
          <Text style={styles.badgeInfo}>
            Badge Count: {advancedTabs[currentTab].badge}
          </Text>
        )}
        
        {advancedTabs[currentTab].disabled && (
          <Text style={styles.disabledInfo}>
            This tab is currently disabled
          </Text>
        )}
      </View>

      {/* Features List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresList}>
          <Text style={styles.feature}>✨ Smooth spring animations</Text>
          <Text style={styles.feature}>🎯 Active tab indicators</Text>
          <Text style={styles.feature}>🔔 Badge support</Text>
          <Text style={styles.feature}>🌙 Light/Dark theme support</Text>
          <Text style={styles.feature}>👆 Long press actions</Text>
          <Text style={styles.feature}>♿ Disabled state support</Text>
          <Text style={styles.feature}>📱 Haptic feedback ready</Text>
          <Text style={styles.feature}>🎨 Customizable colors</Text>
        </View>
      </View>

      {/* Usage Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage</Text>
        <Text style={styles.codeBlock}>
{`import AnimatedTabBar from './AnimatedTabBar';

const tabs = [
  { name: 'Home', icon: 'home', label: 'Home' },
  { name: 'Training', icon: 'fitness', label: 'Training' },
];

<AnimatedTabBar
  tabs={tabs}
  currentTab={currentTab}
  onTabPress={setCurrentTab}
/>`}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  tabBarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  currentTab: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#0057FF',
  },
  badgeInfo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FF3B30',
    marginTop: 8,
  },
  disabledInfo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  control: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  featuresList: {
    marginTop: 8,
  },
  feature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  codeBlock: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1F2937',
    lineHeight: 18,
  },
});

export default TabBarDemo;