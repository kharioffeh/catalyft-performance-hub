import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted') },
      ]
    );
  };

  const profileSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      items: [
        {
          id: 'name',
          label: 'Full Name',
          value: 'John Doe',
          icon: 'person-outline',
          onPress: () => Alert.alert('Edit Name', 'Navigate to edit name'),
        },
        {
          id: 'email',
          label: 'Email Address',
          value: 'john.doe@example.com',
          icon: 'mail-outline',
          onPress: () => Alert.alert('Edit Email', 'Navigate to edit email'),
        },
        {
          id: 'phone',
          label: 'Phone Number',
          value: '+1 (555) 123-4567',
          icon: 'call-outline',
          onPress: () => Alert.alert('Edit Phone', 'Navigate to edit phone'),
        },
        {
          id: 'birthday',
          label: 'Date of Birth',
          value: 'January 15, 1990',
          icon: 'calendar-outline',
          onPress: () => Alert.alert('Edit Birthday', 'Navigate to edit birthday'),
        },
      ],
    },
    {
      id: 'fitness',
      title: 'Fitness Profile',
      items: [
        {
          id: 'height',
          label: 'Height',
          value: '5\'10" (178 cm)',
          icon: 'resize-outline',
          onPress: () => Alert.alert('Edit Height', 'Navigate to edit height'),
        },
        {
          id: 'weight',
          label: 'Weight',
          value: '165 lbs (75 kg)',
          icon: 'scale-outline',
          onPress: () => Alert.alert('Edit Weight', 'Navigate to edit weight'),
        },
        {
          id: 'goals',
          label: 'Fitness Goals',
          value: 'Build muscle, Lose fat',
          icon: 'target-outline',
          onPress: () => Alert.alert('Edit Goals', 'Navigate to edit goals'),
        },
        {
          id: 'experience',
          label: 'Experience Level',
          value: 'Intermediate',
          icon: 'trending-up-outline',
          onPress: () => Alert.alert('Edit Experience', 'Navigate to edit experience'),
        },
      ],
    },
  ];

  const securityItems = [
    {
      id: 'password',
      label: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock-closed-outline',
      onPress: () => Alert.alert('Change Password', 'Navigate to change password'),
    },
    {
      id: 'twoFactor',
      label: 'Two-Factor Authentication',
      subtitle: 'Add an extra layer of security',
      icon: 'shield-checkmark-outline',
      value: twoFactorAuth,
      onToggle: setTwoFactorAuth,
      type: 'toggle',
    },
    {
      id: 'biometric',
      label: 'Biometric Login',
      subtitle: 'Use Face ID or Touch ID',
      icon: 'finger-print-outline',
      value: biometricAuth,
      onToggle: setBiometricAuth,
      type: 'toggle',
    },
  ];

  const notificationItems = [
    {
      id: 'push',
      label: 'Push Notifications',
      subtitle: 'Receive notifications on your device',
      icon: 'notifications-outline',
      value: pushNotifications,
      onToggle: setPushNotifications,
      type: 'toggle',
    },
    {
      id: 'email',
      label: 'Email Notifications',
      subtitle: 'Receive notifications via email',
      icon: 'mail-outline',
      value: emailNotifications,
      onToggle: setEmailNotifications,
      type: 'toggle',
    },
  ];

  const renderProfileCard = (section: any) => (
    <View key={section.id} style={styles.profileCard}>
      <Text style={styles.cardTitle}>{section.title}</Text>
      {section.items.map((item: any) => (
        <TouchableOpacity
          key={item.id}
          style={styles.profileItem}
          onPress={item.onPress}
        >
          <View style={styles.profileItemLeft}>
            <View style={styles.profileItemIcon}>
              <Icon name={item.icon} size={20} color="#007AFF" />
            </View>
            <View style={styles.profileItemInfo}>
              <Text style={styles.profileItemLabel}>{item.label}</Text>
              <Text style={styles.profileItemValue}>{item.value}</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSettingItem = (item: any) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={item.icon} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.label}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#E5E5EA"
        />
      ) : (
        <Icon name="chevron-forward" size={20} color="#C7C7CC" />
      )}
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
            <Icon name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icon name="person" size={40} color="#FFFFFF" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Icon name="camera" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@example.com</Text>
              <View style={styles.premiumBadge}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Cards */}
        {profileSections.map(renderProfileCard)}

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.sectionContent}>
            {securityItems.map(renderSettingItem)}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            {notificationItems.map(renderSettingItem)}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="download-outline" size={20} color="#007AFF" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Export Data</Text>
                  <Text style={styles.settingSubtitle}>Download your fitness data</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name="trash-outline" size={20} color="#FF3B30" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                  <Text style={styles.settingSubtitle}>Permanently remove your account</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

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
  },
  scrollView: {
    flex: 1,
  },
  profileHeaderCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  premiumText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#B45309',
  },
  editProfileButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  profileCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileItemInfo: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    color: '#000000',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
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
  settingSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  dangerText: {
    color: '#FF3B30',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
  },
});