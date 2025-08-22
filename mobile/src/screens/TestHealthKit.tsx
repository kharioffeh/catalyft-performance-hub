import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHealthKit } from '../hooks/useHealthKit';
import { WearableManager } from '../services/wearables/WearableManager';

export const TestHealthKit: React.FC = () => {
  const {
    isAvailable,
    isAuthorized,
    isInitializing,
    error,
    requestPermissions,
    syncData,
  } = useHealthKit();

  const testFeatures = async () => {
    const wearableManager = WearableManager.getInstance();
    
    // Test 1: Get latest metrics
    try {
      const metrics = await wearableManager.getUnifiedMetrics();
      console.log('Latest metrics:', metrics);
      Alert.alert('Success', 'Metrics retrieved successfully. Check console for details.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get metrics: ' + error);
    }
    
    // Test 2: Get real-time heart rate
    try {
      const hr = await wearableManager.getRealTimeHeartRate();
      Alert.alert('Heart Rate', hr ? `Current: ${hr} bpm` : 'No heart rate data available');
    } catch (error) {
      Alert.alert('Error', 'Failed to get heart rate: ' + error);
    }
    
    // Test 3: Get recovery metrics
    try {
      const recovery = await wearableManager.getCombinedRecoveryScore();
      if (recovery) {
        Alert.alert(
          'Recovery Score',
          `Score: ${recovery.score}%\nHRV: ${recovery.hrv.value}ms\nResting HR: ${recovery.restingHeartRate} bpm\n\n${recovery.recommendation}`
        );
      } else {
        Alert.alert('Recovery', 'No recovery data available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get recovery: ' + error);
    }
  };

  const exportTestWorkout = async () => {
    const wearableManager = WearableManager.getInstance();
    
    const testWorkout = {
      id: `test_${Date.now()}`,
      name: 'Test Strength Workout',
      type: 'strength',
      startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      endTime: new Date(),
      duration: 3600,
      calories: 350,
      averageHeartRate: 125,
      maxHeartRate: 165,
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { reps: 10, weight: 135 },
            { reps: 8, weight: 155 },
            { reps: 6, weight: 175 },
          ],
          muscleGroups: ['chest', 'triceps'],
          equipment: 'barbell',
        },
        {
          name: 'Squats',
          sets: [
            { reps: 10, weight: 185 },
            { reps: 8, weight: 205 },
            { reps: 6, weight: 225 },
          ],
          muscleGroups: ['quads', 'glutes'],
          equipment: 'barbell',
        },
      ],
    };
    
    try {
      const results = await wearableManager.exportWorkout(testWorkout);
      const success = Array.from(results.values()).some(v => v);
      
      if (success) {
        Alert.alert('Success', 'Workout exported to Apple Health! Check your Health app.');
      } else {
        Alert.alert('Failed', 'Could not export workout to Apple Health');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export workout: ' + error);
    }
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Initializing HealthKit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HealthKit Test Screen</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Available:</Text>
            <Icon
              name={isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isAvailable ? '#4CAF50' : '#F44336'}
            />
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Authorized:</Text>
            <Icon
              name={isAuthorized ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isAuthorized ? '#4CAF50' : '#F44336'}
            />
          </View>
          
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={[styles.button, !isAvailable && styles.buttonDisabled]}
            onPress={requestPermissions}
            disabled={!isAvailable}
          >
            <Icon name="key" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Request Permissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !isAuthorized && styles.buttonDisabled]}
            onPress={syncData}
            disabled={!isAuthorized}
          >
            <Icon name="sync" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Sync Health Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !isAuthorized && styles.buttonDisabled]}
            onPress={testFeatures}
            disabled={!isAuthorized}
          >
            <Icon name="flask" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Test Features</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, !isAuthorized && styles.buttonDisabled]}
            onPress={exportTestWorkout}
            disabled={!isAuthorized}
          >
            <Icon name="upload" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Export Test Workout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Checklist</Text>
          
          <Text style={styles.checklistItem}>✓ Permission prompt appears</Text>
          <Text style={styles.checklistItem}>✓ Data syncs from Health app</Text>
          <Text style={styles.checklistItem}>✓ Heart rate reads correctly</Text>
          <Text style={styles.checklistItem}>✓ Workouts export to Health</Text>
          <Text style={styles.checklistItem}>✓ Sleep data imports</Text>
          <Text style={styles.checklistItem}>✓ HRV and recovery calculate</Text>
          <Text style={styles.checklistItem}>✓ Background sync works</Text>
        </View>
        
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Remember: HealthKit only works on physical iOS devices, not simulators.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6200EE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  checklistItem: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 8,
    flex: 1,
  },
});