import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Device {
  id: string;
  name: string;
  type: 'whoop' | 'apple' | 'garmin' | 'fitbit';
  connected: boolean;
  battery?: number;
  lastSync?: string;
}

const DeviceSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'WHOOP 4.0',
      type: 'whoop',
      connected: true,
      battery: 85,
      lastSync: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Apple Watch Series 9',
      type: 'apple',
      connected: true,
      battery: 92,
      lastSync: '1 hour ago'
    },
    {
      id: '3',
      name: 'Garmin Forerunner 955',
      type: 'garmin',
      connected: false,
      lastSync: '2 days ago'
    }
  ]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'whoop': return 'watch';
      case 'apple': return 'watch';
      case 'garmin': return 'watch';
      case 'fitbit': return 'watch';
      default: return 'watch';
    }
  };

  const getDeviceColor = (type: string) => {
    switch (type) {
      case 'whoop': return '#EF4444';
      case 'apple': return '#000';
      case 'garmin': return '#007BFF';
      case 'fitbit': return '#00B5AD';
      default: return '#6B7280';
    }
  };

  const handleDeviceToggle = (deviceId: string, connected: boolean) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, connected, lastSync: connected ? 'Just now' : device.lastSync }
          : device
      )
    );
  };

  const addNewDevice = () => {
    Alert.alert(
      'Add Device',
      'Choose device type to connect:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'WHOOP', onPress: () => Alert.alert('WHOOP', 'Device pairing coming soon!') },
        { text: 'Apple Watch', onPress: () => Alert.alert('Apple Watch', 'HealthKit integration coming soon!') },
        { text: 'Garmin', onPress: () => Alert.alert('Garmin', 'Garmin Connect integration coming soon!') },
        { text: 'Fitbit', onPress: () => Alert.alert('Fitbit', 'Fitbit API integration coming soon!') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Connected Devices</Text>
        <TouchableOpacity onPress={addNewDevice}>
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Devices</Text>
        
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceInfo}>
                <View style={[styles.deviceIcon, { backgroundColor: getDeviceColor(device.type) }]}>
                  <Ionicons name={getDeviceIcon(device.type) as any} size={20} color="#fff" />
                </View>
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={[
                    styles.deviceStatus,
                    { color: device.connected ? '#10B981' : '#6B7280' }
                  ]}>
                    {device.connected ? 'Connected' : 'Disconnected'}
                  </Text>
                  {device.lastSync && (
                    <Text style={styles.deviceSync}>Last sync: {device.lastSync}</Text>
                  )}
                </View>
              </View>
              
              <Switch
                value={device.connected}
                onValueChange={(value) => handleDeviceToggle(device.id, value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={device.connected ? '#fff' : '#D1D5DB'}
              />
            </View>
            
            {device.connected && device.battery && (
              <View style={styles.deviceMeta}>
                <View style={styles.batteryInfo}>
                  <Ionicons name="battery-half" size={16} color="#10B981" />
                  <Text style={styles.batteryText}>{device.battery}% battery</Text>
                </View>
                <TouchableOpacity style={styles.syncButton}>
                  <Ionicons name="sync" size={16} color="#3B82F6" />
                  <Text style={styles.syncText}>Sync Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addDeviceButton} onPress={addNewDevice}>
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <Text style={styles.addDeviceText}>Add New Device</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Supported Devices</Text>
          <Text style={styles.infoText}>
            • WHOOP 4.0 - Full strain and recovery tracking{'\n'}
            • Apple Watch - HealthKit integration{'\n'}
            • Garmin - Garmin Connect sync{'\n'}
            • Fitbit - Activity and sleep data
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  deviceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  deviceStatus: {
    fontSize: 14,
    marginBottom: 2,
  },
  deviceSync: {
    fontSize: 12,
    color: '#6B7280',
  },
  deviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  addDeviceText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 32,
    marginBottom: 100,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});

export default DeviceSettingsScreen;