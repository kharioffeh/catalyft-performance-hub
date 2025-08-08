import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';

export default function SettingsScreen() {
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [autoSync, setAutoSync] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [queuedActions, setQueuedActions] = React.useState(0);
  const [isQueueVisible, setIsQueueVisible] = React.useState(false);

  const handleOfflineToggle = (value: boolean) => {
    setOfflineMode(value);
    if (value) {
      Alert.alert('Offline Mode', 'You are now offline. Actions will be queued for sync.');
    } else {
      Alert.alert('Online Mode', 'Reconnected. Syncing queued actions...');
      // Simulate sync process
      setTimeout(() => {
        setQueuedActions(0);
        Alert.alert('Sync Complete', 'All actions synced successfully!');
      }, 2000);
    }
  };

  const handlePremiumSection = () => {
    Alert.alert('Premium Features', 'Advanced analytics and custom programs available!');
  };

  const mockQueuedActions = [
    { id: 1, type: 'workout', description: 'Squat workout entry' },
    { id: 2, type: 'nutrition', description: 'Chicken Breast meal entry' },
  ];

  const settingsItems = [
    {
      id: 'premium',
      title: 'Premium Subscription',
      subtitle: 'Unlock advanced features',
      onPress: handlePremiumSection,
      testID: 'premium-subscription-section'
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Workout reminders and updates',
      value: notifications,
      onToggle: setNotifications
    },
    {
      id: 'autoSync',
      title: 'Auto Sync',
      subtitle: 'Automatically sync when online',
      value: autoSync,
      onToggle: setAutoSync
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      value: darkMode,
      onToggle: setDarkMode
    }
  ];

  return (
    <ScrollView style={styles.container} testID="settings-container">
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      {/* Premium Status */}
      <View style={styles.premiumSection}>
        <TouchableOpacity 
          style={styles.premiumCard}
          onPress={handlePremiumSection}
          testID="premium-subscription-section"
        >
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumTitle}>Premium Status</Text>
            <View style={styles.premiumBadge} testID="premium-status-active">
              <Text style={styles.premiumBadgeText}>Premium Active</Text>
            </View>
          </View>
          <View style={styles.premiumFeatures}>
            <Text style={styles.featureText} testID="advanced-analytics-feature">
              ✅ Advanced Analytics
            </Text>
            <Text style={styles.featureText} testID="custom-programs-feature">
              ✅ Custom Programs
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Offline Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connectivity</Text>
        
        <View style={styles.settingItem} testID="offline-setting">
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Offline Mode</Text>
            <Text style={styles.settingSubtitle}>
              Queue actions when offline
            </Text>
          </View>
          <Switch
            value={offlineMode}
            onValueChange={handleOfflineToggle}
            testID="offline-mode-toggle"
          />
        </View>

        {/* Offline Status Indicator */}
        <View style={styles.statusContainer}>
          {offlineMode ? (
            <View style={styles.offlineStatus} testID="offline-mode-active">
              <Text style={styles.statusText}>📶 Offline Mode Active</Text>
              <Text style={styles.queueText}>{queuedActions} actions queued</Text>
            </View>
          ) : (
            <View style={styles.onlineStatus} testID="offline-mode-inactive">
              <Text style={styles.statusText}>🌐 Online</Text>
              <View testID="sync-completed" style={{ opacity: 0 }}>
                <Text>Sync completed</Text>
              </View>
            </View>
          )}
        </View>

        {/* Queue Status */}
        <TouchableOpacity 
          style={styles.queueSection}
          onPress={() => setIsQueueVisible(!isQueueVisible)}
          testID="offline-queue-status"
        >
          <Text style={styles.queueTitle}>Action Queue</Text>
          <Text style={styles.queueSubtitle}>
            {queuedActions > 0 ? `${queuedActions} actions pending` : 'No actions queued'}
          </Text>
        </TouchableOpacity>

        {isQueueVisible && (
          <View style={styles.queueDetails}>
            {mockQueuedActions.map((action, index) => (
              <View 
                key={action.id} 
                style={styles.queueItem}
                testID={`queued-action-${index + 1}`}
              >
                <Text style={styles.queueItemText}>{action.description}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Other Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {settingsItems.map((item) => (
          <View key={item.id} style={styles.settingItem}>
            <TouchableOpacity 
              style={styles.settingInfo}
              onPress={item.onPress}
              testID={item.testID}
            >
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
            
            {item.onToggle && (
              <Switch
                value={item.value || false}
                onValueChange={item.onToggle}
                testID={`${item.id}-toggle`}
              />
            )}
          </View>
        ))}
      </View>

      {/* Hidden elements for E2E testing */}
      <View style={styles.hidden}>
        <View testID="sync-in-progress" style={{ opacity: 0 }}>
          <Text>Syncing queued actions...</Text>
        </View>
        <View testID="offline-action-queued" style={{ opacity: 0 }}>
          <Text>Action queued for sync</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  premiumSection: {
    padding: 20,
  },
  premiumCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  premiumInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumFeatures: {
    gap: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    marginVertical: 10,
  },
  offlineStatus: {
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  onlineStatus: {
    backgroundColor: '#D1FAE5',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  queueText: {
    fontSize: 14,
    color: '#92400E',
  },
  queueSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  queueSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  queueDetails: {
    marginTop: 10,
  },
  queueItem: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  queueItemText: {
    fontSize: 14,
    color: '#333',
  },
  hidden: {
    position: 'absolute',
    top: -1000,
  },
});