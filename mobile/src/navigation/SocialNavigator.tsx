import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import { FeedScreen } from '../screens/social/FeedScreen';
import { ProfileScreen } from '../screens/social/ProfileScreen';
import { DiscoverScreen } from '../screens/social/DiscoverScreen';
import { ChallengesScreen } from '../screens/social/ChallengesScreen';
import { LeaderboardScreen } from '../screens/social/LeaderboardScreen';
import { PrivacySettingsScreen } from '../screens/social/PrivacySettingsScreen';

// Define navigation params
export type SocialStackParamList = {
  SocialTabs: undefined;
  Profile: { userId: string };
  ChallengeDetails: { challengeId: string };
  PostDetails: { postId: string };
  Comments: { postId: string };
  PrivacySettings: undefined;
  EditProfile: undefined;
  Followers: { userId: string };
  Following: { userId: string };
};

export type SocialTabParamList = {
  Feed: undefined;
  Discover: undefined;
  Challenges: undefined;
  Leaderboard: undefined;
  MyProfile: undefined;
};

const Stack = createNativeStackNavigator<SocialStackParamList>();
const Tab = createBottomTabNavigator<SocialTabParamList>();

// Social Tabs Navigator
const SocialTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Feed':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Discover':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Challenges':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'podium' : 'podium-outline';
              break;
            case 'MyProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Challenges" 
        component={ChallengesScreen}
        options={{ title: 'Challenges' }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ title: 'Rankings' }}
      />
      <Tab.Screen 
        name="MyProfile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Social Navigator
export const SocialNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="SocialTabs" 
        component={SocialTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy Settings' }}
      />
      {/* Add more screens as needed */}
    </Stack.Navigator>
  );
};

export default SocialNavigator;