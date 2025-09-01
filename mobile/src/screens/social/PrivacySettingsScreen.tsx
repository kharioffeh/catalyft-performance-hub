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
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
    allowMessages: 'following',
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
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name="shield-outline" size={20} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{setting.label}</Text>
          {setting.description && (
            <Text style={styles.settingDescription}>{setting.description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        ios_backgroundColor="#E5E5EA"
      />
    </View>
  );

  const renderSelect = (
    setting: any,
    value: string,
    onChange: (value: string) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name="options-outline" size={20} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{setting.label}</Text>
          {setting.description && (
            <Text style={styles.settingDescription}>{setting.description}</Text>
          )}
        </View>
      </View>
      <View style={styles.selectContainer}>
        <Text style={styles.selectValue}>
          {setting.options?.find((opt: any) => opt.value === value)?.label}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          {hasChanges && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Quick Privacy Presets */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>Quick Privacy Presets</Text>
          <View style={styles.presetsContainer}>
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('public')}
              style={[styles.presetButton, styles.presetPublic]}
            >
              <Ionicons name="earth" size={24} color="#4CAF50" />
              <Text style={[styles.presetText, styles.presetTextPublic]}>
                Public
              </Text>
              <Text style={styles.presetSubtext}>Share openly</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('friends')}
              style={[styles.presetButton, styles.presetFriends]}
            >
              <Ionicons name="people" size={24} color="#FF9800" />
              <Text style={[styles.presetText, styles.presetTextFriends]}>
                Friends
              </Text>
              <Text style={styles.presetSubtext}>Followers only</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickPrivacy('private')}
              style={[styles.presetButton, styles.presetPrivate]}
            >
              <Ionicons name="lock-closed" size={24} color="#F44336" />
              <Text style={[styles.presetText, styles.presetTextPrivate]}>
                Private
              </Text>
              <Text style={styles.presetSubtext}>Maximum privacy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.description && (
                <Text style={styles.sectionDescription}>{section.description}</Text>
              )}
            </View>
            
            <View style={styles.sectionContent}>
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
          </View>
        ))}

        {/* Blocked Users */}
        <TouchableOpacity style={styles.blockedUsersSection}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIcon}>
              <Ionicons name="ban" size={20} color="#FF3B30" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Blocked Users</Text>
              <Text style={styles.settingDescription}>
                {privacySettings.blockedUsers?.length || 0} blocked
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>

        {/* Privacy Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoTitle}>Privacy First</Text>
          </View>
          <Text style={styles.infoText}>
            Your privacy is important to us. These settings give you full control over what information you share. You can participate in challenges and earn achievements without sharing sensitive personal data like weight or body measurements.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    margin: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  presetsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  presetsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetPublic: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  presetFriends: {
    backgroundColor: '#FFF8E1',
    borderColor: '#F59E0B',
  },
  presetPrivate: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  presetText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  presetTextPublic: {
    color: '#10B981',
  },
  presetTextFriends: {
    color: '#F59E0B',
  },
  presetTextPrivate: {
    color: '#EF4444',
  },
  presetSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  sectionContent: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: 17,
    color: '#007AFF',
    marginRight: 8,
  },
  blockedUsersSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
});