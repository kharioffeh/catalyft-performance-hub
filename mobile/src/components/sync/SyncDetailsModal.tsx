import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { networkMonitor } from '../../services/offline/networkMonitor';
import { syncQueue, SyncOperation } from '../../services/offline/syncQueue';
import { syncEngine } from '../../services/offline/syncEngine';
import { backgroundSync } from '../../services/offline/backgroundSync';
import { offlineStorage } from '../../services/offline/storage';
import { formatDistanceToNow, format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SyncDetailsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SyncDetailsModal: React.FC<SyncDetailsModalProps> = ({
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'settings'>('queue');
  const [pendingOps, setPendingOps] = useState<SyncOperation[]>([]);
  const [failedOps, setFailedOps] = useState<SyncOperation[]>([]);
  const [completedOps, setCompletedOps] = useState<SyncOperation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(networkMonitor.getStatus());
  const [syncStatus, setSyncStatus] = useState(syncEngine.getSyncStatus());
  const [storageStats, setStorageStats] = useState<any>(null);
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(true);
  const [wifiOnlySync, setWifiOnlySync] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      loadData();
      
      // Subscribe to updates
      const unsubscribeQueue = syncQueue.subscribe(() => {
        loadQueueData();
      });

      const handleNetworkChange = (status: any) => {
        setNetworkStatus(status);
      };
      networkMonitor.on('status', handleNetworkChange);

      return () => {
        unsubscribeQueue();
        networkMonitor.off('status', handleNetworkChange);
      };
    }
  }, [visible]);

  const loadData = () => {
    loadQueueData();
    setSyncStatus(syncEngine.getSyncStatus());
    setStorageStats(offlineStorage.getStats());
    loadSettings();
  };

  const loadQueueData = () => {
    setPendingOps(syncQueue.getPendingOperations());
    setFailedOps(syncQueue.getFailedOperations());
    setCompletedOps(syncQueue.getCompletedOperations());
  };

  const loadSettings = async () => {
    const bgSyncStatus = backgroundSync.getStatus();
    setBackgroundSyncEnabled(bgSyncStatus.schedule.enabled);
    setWifiOnlySync(bgSyncStatus.schedule.wifiOnly);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncEngine.sync();
    loadData();
    setIsRefreshing(false);
  };

  const handleManualSync = async () => {
    Alert.alert(
      'Manual Sync',
      'This will sync all pending changes with the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync Now',
          onPress: async () => {
            await syncEngine.sync({ forceSync: true });
            loadData();
          },
        },
      ]
    );
  };

  const handleRetryFailed = async () => {
    await syncQueue.retryFailed();
    loadData();
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. You may need to re-download data when online. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineStorage.clear();
            loadData();
          },
        },
      ]
    );
  };

  const handleBackgroundSyncToggle = async (enabled: boolean) => {
    setBackgroundSyncEnabled(enabled);
    await backgroundSync.setEnabled(enabled);
  };

  const handleWifiOnlyToggle = async (enabled: boolean) => {
    setWifiOnlySync(enabled);
    await backgroundSync.updateSchedule({ wifiOnly: enabled });
  };

  const renderQueueTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Network Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Connection:</Text>
            <View style={styles.statusValue}>
              <Ionicons
                name={networkStatus.isConnected ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={networkStatus.isConnected ? '#6BCF7F' : '#FF6B6B'}
              />
              <Text style={styles.statusText}>
                {networkStatus.isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Type:</Text>
            <Text style={styles.statusText}>{networkStatus.type}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Quality:</Text>
            <Text style={styles.statusText}>{networkStatus.quality}</Text>
          </View>
        </View>
      </View>

      {/* Pending Operations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pending Operations ({pendingOps.length})
          </Text>
          {pendingOps.length > 0 && (
            <TouchableOpacity onPress={handleManualSync}>
              <Ionicons name="sync" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
        {pendingOps.length === 0 ? (
          <Text style={styles.emptyText}>No pending operations</Text>
        ) : (
          pendingOps.map((op) => (
            <View key={op.id} style={styles.operationCard}>
              <View style={styles.operationHeader}>
                <Text style={styles.operationType}>{op.type}</Text>
                <Text style={styles.operationEntity}>{op.entity}</Text>
              </View>
              <Text style={styles.operationTime}>
                {formatDistanceToNow(op.timestamp, { addSuffix: true })}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Failed Operations */}
      {failedOps.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>
              Failed Operations ({failedOps.length})
            </Text>
            <TouchableOpacity onPress={handleRetryFailed}>
              <Text style={styles.retryButton}>Retry All</Text>
            </TouchableOpacity>
          </View>
          {failedOps.map((op) => (
            <View key={op.id} style={[styles.operationCard, styles.failedCard]}>
              <View style={styles.operationHeader}>
                <Text style={styles.operationType}>{op.type}</Text>
                <Text style={styles.operationEntity}>{op.entity}</Text>
              </View>
              <Text style={styles.errorText}>{op.error || 'Unknown error'}</Text>
              <Text style={styles.operationTime}>
                Failed {formatDistanceToNow(op.lastAttempt || op.timestamp, { addSuffix: true })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync History</Text>
        
        {/* Last Sync Info */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Sync:</Text>
            <Text style={styles.statusText}>
              {syncStatus.lastSync.size > 0
                ? formatDistanceToNow(
                    Math.max(...Array.from(syncStatus.lastSync.values())),
                    { addSuffix: true }
                  )
                : 'Never'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Pending:</Text>
            <Text style={styles.statusText}>{syncStatus.pendingOperations}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Conflicts:</Text>
            <Text style={styles.statusText}>{syncStatus.conflicts}</Text>
          </View>
        </View>

        {/* Completed Operations */}
        <Text style={styles.subsectionTitle}>Recent Syncs</Text>
        {completedOps.length === 0 ? (
          <Text style={styles.emptyText}>No completed operations</Text>
        ) : (
          completedOps.slice(0, 20).map((op) => (
            <View key={op.id} style={[styles.operationCard, styles.completedCard]}>
              <View style={styles.operationHeader}>
                <Text style={styles.operationType}>{op.type}</Text>
                <Text style={styles.operationEntity}>{op.entity}</Text>
              </View>
              <Text style={styles.operationTime}>
                {format(op.timestamp, 'MMM d, h:mm a')}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Sync Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Background Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically sync data in the background
            </Text>
          </View>
          <Switch
            value={backgroundSyncEnabled}
            onValueChange={handleBackgroundSyncToggle}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>WiFi Only</Text>
            <Text style={styles.settingDescription}>
              Only sync when connected to WiFi
            </Text>
          </View>
          <Switch
            value={wifiOnlySync}
            onValueChange={handleWifiOnlyToggle}
            trackColor={{ false: '#E0E0E0', true: '#4ECDC4' }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* Storage Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Cache Size:</Text>
            <Text style={styles.statusText}>
              {storageStats?.totalSize ? (storageStats.totalSize / (1024 * 1024)).toFixed(2) : '0.00'} MB
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Items Cached:</Text>
            <Text style={styles.statusText}>{storageStats?.itemCount || 0}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Oldest Item:</Text>
            <Text style={styles.statusText}>
              {storageStats?.oldestItem
                ? formatDistanceToNow(storageStats.oldestItem, { addSuffix: true })
                : 'N/A'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
          <Text style={styles.clearButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sync Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'queue' && styles.activeTab]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>
              Queue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'queue' && renderQueueTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  operationCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  failedCard: {
    borderLeftColor: '#FF6B6B',
  },
  completedCard: {
    borderLeftColor: '#6BCF7F',
  },
  operationHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  operationType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
  },
  operationEntity: {
    fontSize: 12,
    color: '#666',
  },
  operationTime: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  retryButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});