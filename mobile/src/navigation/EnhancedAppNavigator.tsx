import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AnimatedTabBar from '../components/ui/AnimatedTabBar';
import { useTabNavigation } from '../hooks/useTabNavigation';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ProfileScreen from '../screens/auth/ProfileScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import TrainingScreen from '../screens/TrainingScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NutritionScreen from '../screens/NutritionScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Auth context
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab configuration
const TAB_CONFIG = [
  {
    name: 'Dashboard',
    icon: 'home',
    label: 'Home',
    component: DashboardScreen,
  },
  {
    name: 'Training',
    icon: 'fitness',
    label: 'Training',
    component: TrainingScreen,
  },
  {
    name: 'Analytics',
    icon: 'trending-up',
    label: 'Analytics',
    component: AnalyticsScreen,
  },
  {
    name: 'Nutrition',
    icon: 'scale',
    label: 'Nutrition',
    component: NutritionScreen,
  },
  {
    name: 'Profile',
    icon: 'user',
    label: 'Profile',
    component: ProfileScreen,
  },
];

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { currentTab, navigateToTab } = useTabNavigation({
    initialTab: 0,
    tabCount: TAB_CONFIG.length,
  });

  const handleTabPress = (index: number) => {
    navigateToTab(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
          />
        ))}
      </Tab.Navigator>
      
      {/* Custom animated tab bar */}
      <AnimatedTabBar
        tabs={TAB_CONFIG}
        currentTab={currentTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>💪</View>
        <Text style={styles.logoText}>Catalyft</Text>
      </View>
      <ActivityIndicator size="large" color="#0057FF" style={styles.loader} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export default function EnhancedAppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});