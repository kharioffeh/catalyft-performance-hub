/**
 * Privacy Settings Screen - Control what information is shared socially
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { PrivacySettings } from '../../types/social';

interface PrivacySection {
  title: string;
  description?: string;
  settings: {
    key: keyof PrivacySettings;
    label: string;
    description?: string;
    type: 'toggle' | 'select';
    options?: { value: string; label: string }[];
  }[];
}

export const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentUserProfile, updateUserProfile } = useStore();
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showWorkoutDetails: true,
    showNutritionDetails: false,
    showLocation: false,
    allowTagging: true,
    allowMessages: 'followers',
    blockedUsers: [],
    
    // Additional granular settings
    shareWorkoutStats: true,
    sharePersonalRecords: true,
    shareBodyMeasurements: false,
    shareWeight: false,
    shareCaloriesBurned: true,
    shareDuration: true,
    shareExerciseDetails: true,
    shareMealPhotos: false,
    shareMacros: false,
    shareCalorieIntake: false,
    shareStreaks: true,
    shareAchievements: true,
    shareChallengeParticipation: true,
    shareLeaderboardPosition: true,
    allowFriendRequests: true,
    showInDiscovery: true,
    activityFeedPrivacy: 'followers',
    workoutHistoryPrivacy: 'private',
    achievementsPrivacy: 'public',
  } as PrivacySettings);

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUserProfile?.privacySettings) {
      setPrivacySettings(currentUserProfile.privacySettings);
    }
  }, [currentUserProfile]);

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSelect = (key: keyof PrivacySettings, value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ privacySettings });
      Alert.alert('Success', 'Privacy settings updated successfully');
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickPrivacy = (level: 'public' | 'friends' | 'private') => {
    const newSettings = { ...privacySettings };
    
    switch (level) {
      case 'public':
        // Share most things publicly
        newSettings.profileVisibility = 'public';
        newSettings.showWorkoutDetails = true;
        newSettings.shareWorkoutStats = true;
        newSettings.sharePersonalRecords = true;
        newSettings.shareAchievements = true;
        newSettings.shareChallengeParticipation = true;
        newSettings.shareLeaderboardPosition = true;
        newSettings.showInDiscovery = true;
        newSettings.activityFeedPrivacy = 'public';
        newSettings.achievementsPrivacy = 'public';
        break;
        
      case 'friends':
        // Share with followers only
        newSettings.profileVisibility = 'followers';
        newSettings.showWorkoutDetails = true;
        newSettings.shareWorkoutStats = true;
        newSettings.sharePersonalRecords = true;
        newSettings.shareAchievements = true;
        newSettings.shareChallengeParticipation = true;
        newSettings.shareLeaderboardPosition = true;
        newSettings.showInDiscovery = true;
        newSettings.activityFeedPrivacy = 'followers';
        newSettings.workoutHistoryPrivacy = 'followers';
        newSettings.achievementsPrivacy = 'followers';
        break;
        
      case 'private':
        // Maximum privacy
        newSettings.profileVisibility = 'private';
        newSettings.showWorkoutDetails = false;
        newSettings.showNutritionDetails = false;
        newSettings.showLocation = false;
        newSettings.shareBodyMeasurements = false;
        newSettings.shareWeight = false;
        newSettings.shareMealPhotos = false;
        newSettings.shareMacros = false;
        newSettings.shareCalorieIntake = false;
        newSettings.showInDiscovery = false;
        newSettings.activityFeedPrivacy = 'private';
        newSettings.workoutHistoryPrivacy = 'private';
        newSettings.achievementsPrivacy = 'private';
        break;
    }
    
    setPrivacySettings(newSettings);
    setHasChanges(true);
  };

  const sections: PrivacySection[] = [
    {
      title: 'Profile Visibility',
      description: 'Control who can see your profile and content',
      settings: [
        {
          key: 'profileVisibility',
          label: 'Profile Visibility',
          type: 'select',
          options: [
            { value: 'public', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Private' },
          ],
        },
        {
          key: 'showInDiscovery',
          label: 'Show in Discovery',
          description: 'Allow others to find you in user search',
          type: 'toggle',
        },
        {
          key: 'allowFriendRequests',
          label: 'Allow Follow Requests',
          description: 'Let others follow you',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Workout Privacy',
      description: 'Choose what workout information to share',
      settings: [
        {
          key: 'showWorkoutDetails',
          label: 'Share Workout Details',
          description: 'Show your workout activities in your profile',
          type: 'toggle',
        },
        {
          key: 'workoutHistoryPrivacy',
          label: 'Workout History',
          type: 'select',
          options: [
            { value: 'public', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Only Me' },
          ],
        },
        {
          key: 'shareWorkoutStats',
          label: 'Share Workout Statistics',
          description: 'Total workouts, time spent, etc.',
          type: 'toggle',
        },
        {
          key: 'sharePersonalRecords',
          label: 'Share Personal Records',
          description: 'Your PRs and achievements',
          type: 'toggle',
        },
        {
          key: 'shareExerciseDetails',
          label: 'Share Exercise Details',
          description: 'Specific exercises, sets, and reps',
          type: 'toggle',
        },
        {
          key: 'shareCaloriesBurned',
          label: 'Share Calories Burned',
          type: 'toggle',
        },
        {
          key: 'shareDuration',
          label: 'Share Workout Duration',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Body & Health Data',
      description: 'Control sensitive health information',
      settings: [
        {
          key: 'shareBodyMeasurements',
          label: 'Share Body Measurements',
          description: 'Chest, waist, arms, etc.',
          type: 'toggle',
        },
        {
          key: 'shareWeight',
          label: 'Share Weight',
          description: 'Your current weight and changes',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Nutrition Privacy',
      description: 'Control what nutrition data is visible',
      settings: [
        {
          key: 'showNutritionDetails',
          label: 'Share Nutrition Data',
          description: 'Show your meals and nutrition info',
          type: 'toggle',
        },
        {
          key: 'shareMealPhotos',
          label: 'Share Meal Photos',
          type: 'toggle',
        },
        {
          key: 'shareMacros',
          label: 'Share Macronutrients',
          description: 'Protein, carbs, fats breakdown',
          type: 'toggle',
        },
        {
          key: 'shareCalorieIntake',
          label: 'Share Calorie Intake',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Gamification & Social',
      description: 'Control achievement and challenge visibility',
      settings: [
        {
          key: 'shareAchievements',
          label: 'Share Achievements',
          description: 'Show badges and milestones earned',
          type: 'toggle',
        },
        {
          key: 'achievementsPrivacy',
          label: 'Achievement Visibility',
          type: 'select',
          options: [
            { value: 'public', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Only Me' },
          ],
        },
        {
          key: 'shareChallengeParticipation',
          label: 'Share Challenge Participation',
          description: 'Show which challenges you join',
          type: 'toggle',
        },
        {
          key: 'shareLeaderboardPosition',
          label: 'Show on Leaderboards',
          description: 'Display your ranking publicly',
          type: 'toggle',
        },
        {
          key: 'shareStreaks',
          label: 'Share Workout Streaks',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Activity Feed',
      description: 'Control your activity feed privacy',
      settings: [
        {
          key: 'activityFeedPrivacy',
          label: 'Who can see your posts',
          type: 'select',
          options: [
            { value: 'public', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'private', label: 'Only Me' },
          ],
        },
      ],
    },
    {
      title: 'Communication',
      description: 'Control who can interact with you',
      settings: [
        {
          key: 'allowMessages',
          label: 'Direct Messages',
          type: 'select',
          options: [
            { value: 'everyone', label: 'Everyone' },
            { value: 'followers', label: 'Followers Only' },
            { value: 'none', label: 'Nobody' },
          ],
        },
        {
          key: 'allowTagging',
          label: 'Allow Tagging',
          description: 'Let others mention you in posts',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Location',
      settings: [
        {
          key: 'showLocation',
          label: 'Share Location',
          description: 'Show your location on profile and posts',
          type: 'toggle',
        },
      ],
    },
  ];

  const renderToggle = (
    setting: any,
    value: boolean,
    onChange: (value: boolean) => void
  ) => (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 16, color: '#333' }}>{setting.label}</Text>
        {setting.description && (
          <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            {setting.description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E0E0E0', true: '#FFB6B6' }}
        thumbColor={value ? '#FF6B6B' : '#f4f3f4'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  const renderSelect = (
    setting: any,
    value: string,
    onChange: (value: string) => void
  ) => (
    <View style={{ paddingVertical: 12 }}>
      <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>
        {setting.label}
      </Text>
      {setting.description && (
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          {setting.description}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {setting.options?.map((option: any) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: value === option.value ? '#FF6B6B' : '#F0F0F0',
            }}
          >
            <Text style={{
              color: value === option.value ? 'white' : '#333',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: value === option.value ? '600' : '400',
            }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, margin: -8 }}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 16 }}>
            Privacy Settings
          </Text>
        </View>
        
        {hasChanges && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 12,
              backgroundColor: '#FF6B6B',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Privacy Presets */}
        <View style={{
          backgroundColor: 'white',
          margin: 16,
          borderRadius: 12,
          padding: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
            Quick Privacy Presets
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('public')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#E8F5E9',
                alignItems: 'center',
              }}
            >
              <Icon name="earth" size={24} color="#4CAF50" />
              <Text style={{ marginTop: 4, fontWeight: '600', color: '#4CAF50' }}>
                Public
              </Text>
              <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                Share openly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('friends')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#FFF3E0',
                alignItems: 'center',
              }}
            >
              <Icon name="people" size={24} color="#FF9800" />
              <Text style={{ marginTop: 4, fontWeight: '600', color: '#FF9800' }}>
                Friends
              </Text>
              <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                Followers only
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('private')}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#FFEBEE',
                alignItems: 'center',
              }}
            >
              <Icon name="lock-closed" size={24} color="#F44336" />
              <Text style={{ marginTop: 4, fontWeight: '600', color: '#F44336' }}>
                Private
              </Text>
              <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                Maximum privacy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Sections */}
        {sections.map((section, index) => (
          <View
            key={index}
            style={{
              backgroundColor: 'white',
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
              {section.title}
            </Text>
            {section.description && (
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                {section.description}
              </Text>
            )}
            
            {section.settings.map((setting) => (
              <View key={setting.key}>
                {setting.type === 'toggle' ? (
                  renderToggle(
                    setting,
                    privacySettings[setting.key] as boolean,
                    (value) => handleToggle(setting.key, value)
                  )
                ) : (
                  renderSelect(
                    setting,
                    privacySettings[setting.key] as string,
                    (value) => handleSelect(setting.key, value)
                  )
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Blocked Users */}
        <TouchableOpacity
          style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="ban" size={24} color="#F44336" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                Blocked Users
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {privacySettings.blockedUsers?.length || 0} blocked
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* Privacy Info */}
        <View style={{
          margin: 16,
          padding: 16,
          backgroundColor: '#E3F2FD',
          borderRadius: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="information-circle" size={24} color="#2196F3" />
            <Text style={{
              marginLeft: 8,
              fontSize: 14,
              fontWeight: '600',
              color: '#2196F3',
            }}>
              Privacy First
            </Text>
          </View>
          <Text style={{
            marginTop: 8,
            fontSize: 12,
            color: '#666',
            lineHeight: 18,
          }}>
            Your privacy is important to us. These settings give you full control over what information you share. You can participate in challenges and earn achievements without sharing sensitive personal data like weight or body measurements.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};