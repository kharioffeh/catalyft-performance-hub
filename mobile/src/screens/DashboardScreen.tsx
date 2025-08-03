import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface HealthMetrics {
  strain: number;
  recovery: number;
  sleep: number;
  hrv: number;
  restingHR: number;
}

interface TodayStats {
  workoutsCompleted: number;
  caloriesBurned: number;
  stepsTaken: number;
  waterIntake: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    strain: 8.2,
    recovery: 76,
    sleep: 7.3,
    hrv: 45,
    restingHR: 58
  });
  
  const [todayStats, setTodayStats] = useState<TodayStats>({
    workoutsCompleted: 1,
    caloriesBurned: 450,
    stepsTaken: 8234,
    waterIntake: 6
  });

  const [deviceStatus, setDeviceStatus] = useState({
    connected: true,
    lastSync: '2 min ago',
    batteryLevel: 85
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getStrainColor = (strain: number) => {
    if (strain < 5) return '#22c55e'; // Green
    if (strain < 8) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getRecoveryColor = (recovery: number) => {
    if (recovery > 66) return '#22c55e'; // Green
    if (recovery > 33) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    color: string;
    icon: string;
    onPress?: () => void;
  }> = ({ title, value, unit, color, icon, onPress }) => (
    <TouchableOpacity style={styles.metricCard} onPress={onPress}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <View style={styles.metricValue}>
        <Text style={[styles.metricNumber, { color }]}>{value}</Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton: React.FC<{
    title: string;
    icon: string;
    onPress: () => void;
    gradient: string[];
  }> = ({ title, icon, onPress, gradient }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient colors={gradient} style={styles.quickActionGradient}>
        <Ionicons name={icon as any} size={24} color="#fff" />
        <Text style={styles.quickActionText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Settings', { screen: 'Profile' })}
        >
          <Ionicons name="person-circle" size={40} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Device Status */}
      <View style={styles.deviceStatus}>
        <View style={styles.deviceInfo}>
          <Ionicons 
            name={deviceStatus.connected ? "checkmark-circle" : "alert-circle"} 
            size={16} 
            color={deviceStatus.connected ? "#22c55e" : "#ef4444"} 
          />
          <Text style={styles.deviceText}>
            {deviceStatus.connected ? `Synced ${deviceStatus.lastSync}` : 'Device disconnected'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'DeviceSettings' })}>
          <Ionicons name="settings-outline" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Health Metrics Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Strain"
            value={healthMetrics.strain}
            color={getStrainColor(healthMetrics.strain)}
            icon="flash"
            onPress={() => navigation.navigate('Analytics', { screen: 'StrainDetail' })}
          />
          <MetricCard
            title="Recovery"
            value={healthMetrics.recovery}
            unit="%"
            color={getRecoveryColor(healthMetrics.recovery)}
            icon="heart"
            onPress={() => navigation.navigate('Analytics', { screen: 'RecoveryDetail' })}
          />
          <MetricCard
            title="Sleep"
            value={healthMetrics.sleep}
            unit="hrs"
            color="#8B5CF6"
            icon="moon"
            onPress={() => navigation.navigate('Analytics', { screen: 'SleepDetail' })}
          />
          <MetricCard
            title="HRV"
            value={healthMetrics.hrv}
            unit="ms"
            color="#06B6D4"
            icon="pulse"
            onPress={() => navigation.navigate('Analytics')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Start Workout"
            icon="fitness"
            gradient={['#3B82F6', '#1D4ED8']}
            onPress={() => navigation.navigate('Training', { screen: 'LiveSession' })}
          />
          <QuickActionButton
            title="Log Meal"
            icon="restaurant"
            gradient={['#10B981', '#059669']}
            onPress={() => navigation.navigate('Nutrition', { screen: 'FoodSearch' })}
          />
          <QuickActionButton
            title="View Analytics"
            icon="analytics"
            gradient={['#8B5CF6', '#7C3AED']}
            onPress={() => navigation.navigate('Analytics')}
          />
          <QuickActionButton
            title="Programs"
            icon="library"
            gradient={['#F59E0B', '#D97706']}
            onPress={() => navigation.navigate('Training')}
          />
        </View>
      </View>

      {/* Today's Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Ionicons name="fitness" size={20} color="#3B82F6" />
              <Text style={styles.activityLabel}>Workouts</Text>
              <Text style={styles.activityValue}>{todayStats.workoutsCompleted}</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="flame" size={20} color="#EF4444" />
              <Text style={styles.activityLabel}>Calories</Text>
              <Text style={styles.activityValue}>{todayStats.caloriesBurned}</Text>
            </View>
          </View>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Ionicons name="walk" size={20} color="#22C55E" />
              <Text style={styles.activityLabel}>Steps</Text>
              <Text style={styles.activityValue}>{todayStats.stepsTaken.toLocaleString()}</Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="water" size={20} color="#06B6D4" />
              <Text style={styles.activityLabel}>Water (glasses)</Text>
              <Text style={styles.activityValue}>{todayStats.waterIntake}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Training')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentActivities}>
          <TouchableOpacity style={styles.activityListItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="fitness" size={20} color="#3B82F6" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityName}>Morning Run</Text>
              <Text style={styles.activityTime}>30 min • 8:00 AM</Text>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityStat}>3.2 km</Text>
              <Text style={styles.activitySubStat}>285 cal</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.activityListItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="restaurant" size={20} color="#10B981" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityName}>Breakfast</Text>
              <Text style={styles.activityTime}>9:30 AM</Text>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityStat}>420 cal</Text>
              <Text style={styles.activitySubStat}>25g protein</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom padding for tab bar */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    marginBottom: 20,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 8,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricUnit: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 60) / 2,
    marginBottom: 12,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  activityCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityItem: {
    alignItems: 'center',
    flex: 1,
  },
  activityLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  activityValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  recentActivities: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activityTime: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityStat: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activitySubStat: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});

export default DashboardScreen;