import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { WearableManager } from '../../services/wearables/WearableManager';
import {
  WearableDevice,
  WearableType,
  SyncSettings,
  DataTypeSettings,
} from '../../types/wearables';

export const WearableSettings: React.FC = () => {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const wearableManager = WearableManager.getInstance();
  
  useEffect(() => {
    loadDevices();
  }, []);
  
  const loadDevices = () => {
    const connectedDevices = wearableManager.getDevices();
    setDevices(connectedDevices);
  };
  
  const handleAddDevice = async (type: WearableType) => {
    setIsLoading(true);
    setShowAddDevice(false);
    
    try {
      let config = undefined;
      
      // Some devices need API keys
      if (type === 'whoop' && apiKey) {
        config = { apiKey };
      }
      
      const device = await wearableManager.addDevice(type, config);
      
      Alert.alert(
        'Device Connected',
        `${device.name} has been successfully connected.`,
        [{ text: 'OK' }]
      );
      
      loadDevices();
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        `Failed to connect device: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setApiKey('');
    }
  };
  
  const handleRemoveDevice = (device: WearableDevice) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await wearableManager.removeDevice(device.id);
              loadDevices();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device');
            }
          },
        },
      ]
    );
  };
  
  const handleSyncDevice = async (deviceId: string) => {
    setIsSyncing(true);
    
    try {
      const result = await wearableManager.syncDevice(deviceId);
      
      if (result?.success) {
        Alert.alert(
          'Sync Complete',
          `Synced ${result.itemsSynced} items successfully.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sync Failed',
          result?.errors?.join('\n') || 'Unknown error occurred',
          [{ text: 'OK' }]
        );
      }
      
      loadDevices();
    } catch (error) {
      Alert.alert(
        'Sync Error',
        `Failed to sync device: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSyncAll = async () => {
    setIsSyncing(true);
    
    try {
      const results = await wearableManager.syncAllDevices();
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${successful} device(s). ${failed > 0 ? `${failed} device(s) failed.` : ''}`,
        [{ text: 'OK' }]
      );
      
      loadDevices();
    } catch (error) {
      Alert.alert(
        'Sync Error',
        'Failed to sync devices',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  const updateSyncSettings = (device: WearableDevice, settings: Partial<SyncSettings>) => {
    const service = wearableManager.getDeviceService(device.id);
    if (service) {
      service.updateSyncSettings(settings);
      loadDevices();
    }
  };
  
  const renderDeviceCard = (device: WearableDevice) => {
    const isConnected = device.connected;
    const isSyncingDevice = wearableManager.isSyncing(device.id);
    
    return (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => {
          setSelectedDevice(device);
          setShowDeviceSettings(true);
        }}
      >
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Icon
              name={getDeviceIcon(device.type)}
              size={32}
              color={isConnected ? '#6200EE' : '#9E9E9E'}
            />
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={[
                styles.deviceStatus,
                { color: isConnected ? '#4CAF50' : '#F44336' }
              ]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
              {device.lastSync && (
                <Text style={styles.deviceSync}>
                  Last sync: {new Date(device.lastSync).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.deviceActions}>
            {isSyncingDevice ? (
              <ActivityIndicator size="small" color="#6200EE" />
            ) : (
              <TouchableOpacity
                style={styles.syncButton}
                onPress={() => handleSyncDevice(device.id)}
                disabled={!isConnected}
              >
                <Icon
                  name="sync"
                  size={20}
                  color={isConnected ? '#6200EE' : '#CCCCCC'}
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveDevice(device)}
            >
              <Icon name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        {device.battery !== undefined && (
          <View style={styles.batteryContainer}>
            <Icon name="battery-charging" size={16} color="#666" />
            <Text style={styles.batteryText}>{device.battery}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const renderAddDeviceModal = () => {
    const availableDevices: { type: WearableType; name: string; icon: string; requiresApiKey?: boolean }[] = [
      { type: 'apple_watch', name: 'Apple Watch', icon: 'watch' },
      { type: 'whoop', name: 'WHOOP', icon: 'fitness', requiresApiKey: true },
      { type: 'garmin', name: 'Garmin', icon: 'navigate' },
      { type: 'fitbit', name: 'Fitbit', icon: 'pulse' },
      { type: 'google_fit', name: 'Google Fit', icon: 'logo-google' },
    ];
    
    // Filter out already connected devices and platform-specific ones
    const filteredDevices = availableDevices.filter(d => {
      if (devices.some(connected => connected.type === d.type)) return false;
      if (d.type === 'apple_watch' && Platform.OS !== 'ios') return false;
      if (d.type === 'google_fit' && Platform.OS !== 'android') return false;
      return true;
    });
    
    return (
      <Modal
        visible={showAddDevice}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddDevice(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Device</Text>
              <TouchableOpacity onPress={() => setShowAddDevice(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.deviceList}>
              {filteredDevices.map((device) => (
                <TouchableOpacity
                  key={device.type}
                  style={styles.deviceOption}
                  onPress={() => {
                    if (device.requiresApiKey) {
                      Alert.prompt(
                        'API Key Required',
                        `Enter your ${device.name} API key:`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Connect',
                            onPress: (key) => {
                              if (key) {
                                setApiKey(key);
                                handleAddDevice(device.type);
                              }
                            },
                          },
                        ],
                        'plain-text'
                      );
                    } else {
                      handleAddDevice(device.type);
                    }
                  }}
                >
                  <Icon name={device.icon} size={24} color="#6200EE" />
                  <Text style={styles.deviceOptionName}>{device.name}</Text>
                  <Icon name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderDeviceSettingsModal = () => {
    if (!selectedDevice) return null;
    
    const settings = selectedDevice.syncSettings;
    
    return (
      <Modal
        visible={showDeviceSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDevice.name} Settings</Text>
              <TouchableOpacity onPress={() => setShowDeviceSettings(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsList}>
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Sync Settings</Text>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Auto Sync</Text>
                  <Switch
                    value={settings.autoSync}
                    onValueChange={(value) =>
                      updateSyncSettings(selectedDevice, { autoSync: value })
                    }
                    trackColor={{ false: '#CCC', true: '#6200EE' }}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Background Sync</Text>
                  <Switch
                    value={settings.backgroundSync}
                    onValueChange={(value) =>
                      updateSyncSettings(selectedDevice, { backgroundSync: value })
                    }
                    trackColor={{ false: '#CCC', true: '#6200EE' }}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>WiFi Only</Text>
                  <Switch
                    value={settings.wifiOnly}
                    onValueChange={(value) =>
                      updateSyncSettings(selectedDevice, { wifiOnly: value })
                    }
                    trackColor={{ false: '#CCC', true: '#6200EE' }}
                  />
                </View>
                
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Sync Frequency</Text>
                  <TouchableOpacity style={styles.settingValue}>
                    <Text style={styles.settingValueText}>{settings.syncFrequency}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Data Types</Text>
                
                {Object.entries(settings.dataTypes).map(([key, value]) => (
                  <View key={key} style={styles.settingRow}>
                    <Text style={styles.settingLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <Switch
                      value={value}
                      onValueChange={(newValue) => {
                        const newDataTypes = { ...settings.dataTypes, [key]: newValue };
                        updateSyncSettings(selectedDevice, { dataTypes: newDataTypes });
                      }}
                      trackColor={{ false: '#CCC', true: '#6200EE' }}
                    />
                  </View>
                ))}
              </View>
              
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>Conflict Resolution</Text>
                
                <View style={styles.conflictOptions}>
                  {(['device', 'catalyft', 'manual'] as const).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.conflictOption,
                        settings.conflictResolution === option && styles.conflictOptionActive,
                      ]}
                      onPress={() =>
                        updateSyncSettings(selectedDevice, { conflictResolution: option })
                      }
                    >
                      <Text
                        style={[
                          styles.conflictOptionText,
                          settings.conflictResolution === option && styles.conflictOptionTextActive,
                        ]}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {selectedDevice.capabilities && (
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>Device Capabilities</Text>
                  
                  <View style={styles.capabilitiesGrid}>
                    {Object.entries(selectedDevice.capabilities)
                      .filter(([_, supported]) => supported)
                      .map(([capability]) => (
                        <View key={capability} style={styles.capabilityBadge}>
                          <Text style={styles.capabilityText}>
                            {capability.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wearable Devices</Text>
        <TouchableOpacity
          style={styles.syncAllButton}
          onPress={handleSyncAll}
          disabled={isSyncing || devices.length === 0}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#6200EE" />
          ) : (
            <Icon name="sync-circle" size={28} color="#6200EE" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="watch-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Devices Connected</Text>
            <Text style={styles.emptyStateText}>
              Connect your fitness wearables to sync your health data
            </Text>
          </View>
        ) : (
          devices.map(renderDeviceCard)
        )}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddDevice(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="add" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Add Device</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {renderAddDeviceModal()}
      {renderDeviceSettingsModal()}
    </SafeAreaView>
  );
};

const getDeviceIcon = (type: string): string => {
  const icons: Record<string, string> = {
    apple_watch: 'watch',
    whoop: 'fitness',
    garmin: 'navigate',
    fitbit: 'pulse',
    google_fit: 'logo-google',
  };
  return icons[type] || 'watch';
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  syncAllButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  deviceStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  deviceSync: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  batteryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  deviceList: {
    padding: 20,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  deviceOptionName: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
    marginLeft: 16,
  },
  settingsList: {
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: '#6200EE',
  },
  conflictOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conflictOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  conflictOptionActive: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  conflictOptionText: {
    fontSize: 14,
    color: '#666',
  },
  conflictOptionTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  capabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  capabilityBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  capabilityText: {
    fontSize: 12,
    color: '#4CAF50',
  },
});