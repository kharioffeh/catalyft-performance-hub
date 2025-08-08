import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import TrainingScreen from '../screens/TrainingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const getIcon = (label: string) => {
    switch (label) {
      case 'Dashboard': return '🏠';
      case 'Training': return '💪';
      case 'Analytics': return '📊';
      case 'Nutrition': return '🍎';
      case 'Settings': return '⚙️';
      default: return '●';
    }
  };

  return (
    <Text style={{ 
      fontSize: 20, 
      opacity: focused ? 1 : 0.6,
      color: focused ? '#4F46E5' : '#666'
    }}>
      {getIcon(label)}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarButton: (props) => {
              const { onPress, onLongPress, accessibilityRole, style } = props;
              return (
                <TouchableOpacity 
                  testID="tab-Dashboard"
                  onPress={onPress}
                  onLongPress={onLongPress || undefined}
                  accessibilityRole={accessibilityRole}
                  style={style}
                >
                  {props.children}
                </TouchableOpacity>
              );
            }
          }}
        />
        <Tab.Screen 
          name="Training" 
          component={TrainingScreen}
          options={{
            tabBarButton: (props) => {
              const { onPress, onLongPress, accessibilityRole, style } = props;
              return (
                <TouchableOpacity 
                  testID="tab-Training"
                  onPress={onPress}
                  onLongPress={onLongPress || undefined}
                  accessibilityRole={accessibilityRole}
                  style={style}
                >
                  {props.children}
                </TouchableOpacity>
              );
            }
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{
            tabBarButton: (props) => {
              const { onPress, onLongPress, accessibilityRole, style } = props;
              return (
                <TouchableOpacity 
                  testID="tab-Analytics"
                  onPress={onPress}
                  onLongPress={onLongPress || undefined}
                  accessibilityRole={accessibilityRole}
                  style={style}
                >
                  {props.children}
                </TouchableOpacity>
              );
            }
          }}
        />
        <Tab.Screen 
          name="Nutrition" 
          component={NutritionScreen}
          options={{
            tabBarButton: (props) => {
              const { onPress, onLongPress, accessibilityRole, style } = props;
              return (
                <TouchableOpacity 
                  testID="tab-Nutrition"
                  onPress={onPress}
                  onLongPress={onLongPress || undefined}
                  accessibilityRole={accessibilityRole}
                  style={style}
                >
                  {props.children}
                </TouchableOpacity>
              );
            }
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarButton: (props) => {
              const { onPress, onLongPress, accessibilityRole, style } = props;
              return (
                <TouchableOpacity 
                  testID="tab-Settings"
                  onPress={onPress}
                  onLongPress={onLongPress || undefined}
                  accessibilityRole={accessibilityRole}
                  style={style}
                >
                  {props.children}
                </TouchableOpacity>
              );
            }
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}