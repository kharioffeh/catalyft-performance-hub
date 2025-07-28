import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Watch,
  Smartphone,
  Activity,
  Bluetooth,
  X,
  CheckCircle,
} from 'lucide-react-native';
import { WearableDevice } from '@/hooks/useWearableData';

interface WearableConnectionPanelProps {
  onConnectDevice: (deviceType: WearableDevice['type']) => Promise<void>;
}

interface DeviceOption {
  type: WearableDevice['type'];
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  connectionMethod: string;
}

export const WearableConnectionPanel: React.FC<WearableConnectionPanelProps> = ({
  onConnectDevice,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const deviceOptions: DeviceOption[] = [
    {
      type: 'apple_watch',
      name: 'Apple Watch',
      icon: <Watch size={24} color="#fff" />,
      description: 'Most accurate heart rate monitoring with HealthKit integration',
      features: ['Real-time HR', 'HRV', 'Calories', 'Workout detection'],
      connectionMethod: 'HealthKit Authorization',
    },
    {
      type: 'fitbit',
      name: 'Fitbit',
      icon: <Activity size={24} color="#fff" />,
      description: 'Popular fitness tracker with comprehensive health metrics',
      features: ['Heart rate', 'Steps', 'Sleep', 'Active minutes'],
      connectionMethod: 'OAuth Authentication',
    },
    {
      type: 'polar',
      name: 'Polar H10',
      icon: <Bluetooth size={24} color="#fff" />,
      description: 'Professional heart rate chest strap with highest accuracy',
      features: ['Real-time HR', 'HRV', 'Ultra-precise readings'],
      connectionMethod: 'Bluetooth LE',
    },
    {
      type: 'garmin',
      name: 'Garmin',
      icon: <Watch size={24} color="#fff" />,
      description: 'Sports-focused wearables with advanced training metrics',
      features: ['Heart rate', 'Training load', 'Recovery', 'VO2 max'],
      connectionMethod: 'Bluetooth LE',
    },
    {
      type: 'whoop',
      name: 'WHOOP',
      icon: <Activity size={24} color="#fff" />,
      description: '24/7 strain and recovery tracking',
      features: ['Strain score', 'Recovery', 'Sleep', 'HRV'],
      connectionMethod: 'API Integration',
    },
    {
      type: 'samsung_health',
      name: 'Samsung Health',
      icon: <Smartphone size={24} color="#fff" />,
      description: 'Samsung\'s health platform with Galaxy Watch integration',
      features: ['Heart rate', 'Steps', 'Stress', 'Sleep'],
      connectionMethod: 'Samsung Health SDK',
    },
  ];

  const handleConnect = async (deviceType: WearableDevice['type']) => {
    setConnecting(deviceType);
    
    try {
      await onConnectDevice(deviceType);
      setShowModal(false);
      Alert.alert(
        'Device Connected!',
        'Your wearable device has been successfully connected and will now provide real-time data during workouts.',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        error instanceof Error ? error.message : 'Failed to connect device. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setConnecting(null);
    }
  };

  const getConnectionInstructions = (device: DeviceOption) => {
    switch (device.type) {
      case 'apple_watch':
        return [
          '1. Ensure your Apple Watch is paired with this iPhone',
          '2. Open the Health app and verify heart rate permissions',
          '3. Tap "Connect Apple Watch" below',
          '4. Grant permission when prompted'
        ];
      case 'fitbit':
        return [
          '1. Make sure your Fitbit device is synced',
          '2. Tap "Connect Fitbit" to open authorization',
          '3. Log in to your Fitbit account',
          '4. Grant permission for heart rate and activity data'
        ];
      case 'polar':
        return [
          '1. Turn on your Polar H10 chest strap',
          '2. Ensure Bluetooth is enabled on your device',
          '3. Tap "Connect Polar" below',
          '4. Select your device from the Bluetooth list'
        ];
      default:
        return [
          '1. Ensure your device is nearby and powered on',
          '2. Enable Bluetooth on your phone',
          '3. Tap "Connect" below',
          '4. Follow the pairing instructions'
        ];
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Activity size={20} color="#3b82f6" />
          <Text style={styles.title}>Connect Wearable Device</Text>
        </View>
        
        <Text style={styles.description}>
          Connect a heart rate monitor or fitness tracker for real-time strain monitoring during your workout.
        </Text>
        
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => setShowModal(true)}
        >
          <Bluetooth size={20} color="#fff" />
          <Text style={styles.connectButtonText}>Connect Device</Text>
        </TouchableOpacity>
      </View>

      {/* Device Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Connect Wearable Device</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Choose your wearable device to enable real-time heart rate monitoring and enhanced strain calculation.
            </Text>

            <View style={styles.deviceList}>
              {deviceOptions.map((device) => (
                <View key={device.type} style={styles.deviceCard}>
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceIcon}>
                      {device.icon}
                    </View>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{device.name}</Text>
                      <Text style={styles.deviceDescription}>{device.description}</Text>
                    </View>
                  </View>

                  <View style={styles.deviceFeatures}>
                    <Text style={styles.featuresTitle}>Features:</Text>
                    <View style={styles.featuresList}>
                      {device.features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                          <CheckCircle size={12} color="#22c55e" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.connectionInfo}>
                    <Text style={styles.connectionMethod}>
                      Connection: {device.connectionMethod}
                    </Text>
                  </View>

                  <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>How to connect:</Text>
                    {getConnectionInstructions(device).map((instruction, index) => (
                      <Text key={index} style={styles.instructionText}>
                        {instruction}
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.deviceConnectButton,
                      connecting === device.type && styles.connectingButton
                    ]}
                    onPress={() => handleConnect(device.type)}
                    disabled={connecting !== null}
                  >
                    <Text style={styles.deviceConnectButtonText}>
                      {connecting === device.type ? 'Connecting...' : `Connect ${device.name}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Why connect a wearable device?</Text>
              <Text style={styles.infoText}>
                Wearable devices provide real-time heart rate data that enables:
              </Text>
              <View style={styles.infoList}>
                <Text style={styles.infoItem}>• More accurate strain calculations</Text>
                <Text style={styles.infoItem}>• Heart rate zone monitoring</Text>
                <Text style={styles.infoItem}>• Training intensity guidance</Text>
                <Text style={styles.infoItem}>• Better recovery recommendations</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 24,
  },
  deviceList: {
    gap: 20,
  },
  deviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
  deviceFeatures: {
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#ccc',
  },
  connectionInfo: {
    marginBottom: 12,
  },
  connectionMethod: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  instructions: {
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
    marginBottom: 2,
  },
  deviceConnectButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectingButton: {
    backgroundColor: '#6b7280',
  },
  deviceConnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default WearableConnectionPanel;