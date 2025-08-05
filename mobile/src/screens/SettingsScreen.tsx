import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ConnectionTester from '../components/ConnectionTester';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const userInfo = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    memberSince: "January 2024",
    subscription: "Performance Plan"
  };

  const connectedDevices = [
    { name: "WHOOP 4.0", status: "Connected", battery: 85 },
    { name: "Apple Watch", status: "Synced 2h ago", battery: null }
  ];

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: "Account",
      items: [
        {
          id: 'profile',
          title: 'Profile',
          subtitle: 'Personal information and goals',
          icon: 'person-outline',
          type: 'navigation',
          onPress: () => navigation.navigate('Profile')
        },
        {
          id: 'subscription',
          title: 'Subscription',
          subtitle: userInfo.subscription,
          icon: 'card-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Subscription', 'Manage your subscription via web app')
        }
      ]
    },
    {
      title: "Devices & Data",
      items: [
        {
          id: 'devices',
          title: 'Connected Devices',
          subtitle: `${connectedDevices.length} devices connected`,
          icon: 'watch-outline',
          type: 'navigation',
          onPress: () => navigation.navigate('DeviceSettings')
        },
        {
          id: 'sync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync device data',
          icon: 'sync-outline',
          type: 'switch',
          value: autoSync,
          onToggle: setAutoSync
        },
        {
          id: 'data',
          title: 'Data Export',
          subtitle: 'Download your fitness data',
          icon: 'download-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Data Export', 'Export feature coming soon!')
        }
      ]
    },
    {
      title: "Notifications",
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Workout reminders and insights',
          icon: 'notifications-outline',
          type: 'switch',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        {
          id: 'notification-settings',
          title: 'Notification Settings',
          subtitle: 'Customize notification preferences',
          icon: 'settings-outline',
          type: 'navigation',
          onPress: () => navigation.navigate('NotificationSettings')
        }
      ]
    },
    {
      title: "Security & Privacy",
      items: [
        {
          id: 'biometric',
          title: 'Biometric Lock',
          subtitle: 'Use Face ID or fingerprint',
          icon: 'finger-print-outline',
          type: 'switch',
          value: biometricEnabled,
          onToggle: setBiometricEnabled
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          icon: 'shield-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy Policy', 'View privacy policy in web app')
        }
      ]
    },
    {
      title: "App Preferences",
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'moon-outline',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode
        },
        {
          id: 'units',
          title: 'Units',
          subtitle: 'Metric (kg, cm)',
          icon: 'scale-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Units', 'Unit preferences coming soon!')
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English',
          icon: 'language-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Language', 'Language selection coming soon!')
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          icon: 'help-circle-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Help Center', 'Visit help center in web app')
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          icon: 'mail-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Contact Support', 'Email: support@catalyft.com')
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'chatbubble-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Feedback', 'Feedback form coming soon!')
        }
      ]
    },
    {
      title: "About",
      items: [
        {
          id: 'version',
          title: 'App Version',
          subtitle: '1.0.0 (Build 1)',
          icon: 'information-circle-outline',
          type: 'navigation',
          onPress: () => {}
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Legal terms and conditions',
          icon: 'document-text-outline',
          type: 'navigation',
          onPress: () => Alert.alert('Terms of Service', 'View terms in web app')
        }
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        }
      ]
    );
  };

  const SettingsItemComponent: React.FC<{ item: SettingsItem }> = ({ item }) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIcon, item.color ? { backgroundColor: item.color } : undefined]}>
          <Ionicons name={item.icon as any} size={20} color="#fff" />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingsItemRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#374151', true: '#3B82F6' }}
            thumbColor={item.value ? '#fff' : '#D1D5DB'}
          />
        ) : item.type === 'navigation' ? (
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Connection Tester */}
      <ConnectionTester />

      {/* User Profile Card */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
            <Text style={styles.profileMember}>Member since {userInfo.memberSince}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Connected Devices Quick View */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        <View style={styles.devicesContainer}>
          {connectedDevices.map((device, index) => (
            <View key={index} style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Ionicons name="watch" size={20} color="#10B981" />
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceStatus}>{device.status}</Text>
                </View>
              </View>
              {device.battery && (
                <View style={styles.batteryInfo}>
                  <Ionicons name="battery-half" size={16} color="#6B7280" />
                  <Text style={styles.batteryLevel}>{device.battery}%</Text>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity 
            style={styles.manageDevicesButton}
            onPress={() => navigation.navigate('DeviceSettings')}
          >
            <Text style={styles.manageDevicesText}>Manage Devices</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.settingsGroup}>
            {section.items.map((item, index) => (
              <View key={item.id}>
                <SettingsItemComponent item={item} />
                {index < section.items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  profileMember: {
    fontSize: 12,
    color: '#6B7280',
  },
  devicesContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  deviceStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryLevel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  manageDevicesButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageDevicesText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  settingsGroup: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsItemRight: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
    marginLeft: 68,
  },
  logoutButton: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default SettingsScreen;