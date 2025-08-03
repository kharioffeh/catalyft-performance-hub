import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import TrainingScreen from '../screens/TrainingScreen';
import NutritionScreen from '../screens/NutritionScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import detailed screens
import StrainDetailScreen from '../screens/analytics/StrainDetailScreen';
import RecoveryDetailScreen from '../screens/analytics/RecoveryDetailScreen';
import SleepDetailScreen from '../screens/analytics/SleepDetailScreen';
import WorkoutDetailScreen from '../screens/training/WorkoutDetailScreen';
import LiveSessionScreen from '../screens/training/LiveSessionScreen';
import ProgramDetailScreen from '../screens/training/ProgramDetailScreen';
import MealDetailScreen from '../screens/nutrition/MealDetailScreen';
import FoodSearchScreen from '../screens/nutrition/FoodSearchScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import DeviceSettingsScreen from '../screens/settings/DeviceSettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// Navigation types
export type RootTabParamList = {
  Dashboard: undefined;
  Analytics: undefined;
  Training: undefined;
  Nutrition: undefined;
  Settings: undefined;
};

export type AnalyticsStackParamList = {
  AnalyticsHome: undefined;
  StrainDetail: { date?: string };
  RecoveryDetail: { date?: string };
  SleepDetail: { date?: string };
};

export type TrainingStackParamList = {
  TrainingHome: undefined;
  WorkoutDetail: { workoutId: string };
  LiveSession: { workoutId?: string };
  ProgramDetail: { programId: string };
};

export type NutritionStackParamList = {
  NutritionHome: undefined;
  MealDetail: { mealId: string };
  FoodSearch: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  DeviceSettings: undefined;
  NotificationSettings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const AnalyticsStack = createStackNavigator<AnalyticsStackParamList>();
const TrainingStack = createStackNavigator<TrainingStackParamList>();
const NutritionStack = createStackNavigator<NutritionStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Stack Navigators
function AnalyticsNavigator() {
  return (
    <AnalyticsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <AnalyticsStack.Screen 
        name="AnalyticsHome" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <AnalyticsStack.Screen 
        name="StrainDetail" 
        component={StrainDetailScreen}
        options={{ title: 'Strain Details' }}
      />
      <AnalyticsStack.Screen 
        name="RecoveryDetail" 
        component={RecoveryDetailScreen}
        options={{ title: 'Recovery Details' }}
      />
      <AnalyticsStack.Screen 
        name="SleepDetail" 
        component={SleepDetailScreen}
        options={{ title: 'Sleep Analysis' }}
      />
    </AnalyticsStack.Navigator>
  );
}

function TrainingNavigator() {
  return (
    <TrainingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <TrainingStack.Screen 
        name="TrainingHome" 
        component={TrainingScreen}
        options={{ title: 'Training' }}
      />
      <TrainingStack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <TrainingStack.Screen 
        name="LiveSession" 
        component={LiveSessionScreen}
        options={{ title: 'Live Session', headerShown: false }}
      />
      <TrainingStack.Screen 
        name="ProgramDetail" 
        component={ProgramDetailScreen}
        options={{ title: 'Training Program' }}
      />
    </TrainingStack.Navigator>
  );
}

function NutritionNavigator() {
  return (
    <NutritionStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <NutritionStack.Screen 
        name="NutritionHome" 
        component={NutritionScreen}
        options={{ title: 'Nutrition' }}
      />
      <NutritionStack.Screen 
        name="MealDetail" 
        component={MealDetailScreen}
        options={{ title: 'Meal Details' }}
      />
      <NutritionStack.Screen 
        name="FoodSearch" 
        component={FoodSearchScreen}
        options={{ title: 'Search Food' }}
      />
    </NutritionStack.Navigator>
  );
}

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <SettingsStack.Screen 
        name="SettingsHome" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <SettingsStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <SettingsStack.Screen 
        name="DeviceSettings" 
        component={DeviceSettingsScreen}
        options={{ title: 'Connected Devices' }}
      />
      <SettingsStack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
    </SettingsStack.Navigator>
  );
}

// Main Tab Navigator
function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#000" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Analytics':
                iconName = focused ? 'analytics' : 'analytics-outline';
                break;
              case 'Training':
                iconName = focused ? 'fitness' : 'fitness-outline';
                break;
              case 'Nutrition':
                iconName = focused ? 'restaurant' : 'restaurant-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'circle';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#374151',
            paddingBottom: 5,
            paddingTop: 5,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsNavigator}
          options={{ title: 'Analytics' }}
        />
        <Tab.Screen 
          name="Training" 
          component={TrainingNavigator}
          options={{ title: 'Training' }}
        />
        <Tab.Screen 
          name="Nutrition" 
          component={NutritionNavigator}
          options={{ title: 'Nutrition' }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsNavigator}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;