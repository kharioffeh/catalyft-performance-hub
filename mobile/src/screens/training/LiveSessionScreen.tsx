import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface WorkoutStats {
  duration: number;
  calories: number;
  heartRate: number;
  strain: number;
}

const LiveSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutId } = route.params as { workoutId?: string };
  
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<WorkoutStats>({
    duration: 0,
    calories: 0,
    heartRate: 145,
    strain: 6.2
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          duration: prev.duration + 1,
          calories: prev.calories + (Math.random() * 2),
          heartRate: Math.max(120, Math.min(180, prev.heartRate + (Math.random() - 0.5) * 10)),
          strain: Math.max(0, Math.min(20, prev.strain + (Math.random() - 0.5) * 0.1))
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Workout', 
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            setIsPaused(false);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const getHeartRateZone = (hr: number) => {
    if (hr < 120) return { zone: 'Rest', color: '#6B7280' };
    if (hr < 140) return { zone: 'Fat Burn', color: '#10B981' };
    if (hr < 160) return { zone: 'Cardio', color: '#F59E0B' };
    if (hr < 180) return { zone: 'Peak', color: '#EF4444' };
    return { zone: 'Max', color: '#7C2D12' };
  };

  const heartRateZone = getHeartRateZone(stats.heartRate);

  const StatCard: React.FC<{
    title: string;
    value: string;
    unit?: string;
    color?: string;
  }> = ({ title, value, unit, color = '#fff' }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statValue}>
        <Text style={[styles.statNumber, { color }]}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {workoutId === 'free' ? 'Free Training' : 
           workoutId === 'hiit' ? 'HIIT Session' :
           workoutId === 'strength' ? 'Strength Training' : 'Live Session'}
        </Text>
        <TouchableOpacity onPress={handleStop}>
          <Ionicons name="stop" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Main Timer */}
      <View style={styles.timerSection}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.timerContainer}
        >
          <Text style={styles.timerLabel}>Workout Time</Text>
          <Text style={styles.timerValue}>{formatTime(stats.duration)}</Text>
          <View style={styles.timerStatus}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: isActive ? (isPaused ? '#F59E0B' : '#10B981') : '#6B7280' }
            ]} />
            <Text style={styles.statusText}>
              {!isActive ? 'Ready' : isPaused ? 'Paused' : 'Active'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Calories"
            value={Math.round(stats.calories).toString()}
            unit="cal"
          />
          <StatCard
            title="Heart Rate"
            value={Math.round(stats.heartRate).toString()}
            unit="bpm"
            color={heartRateZone.color}
          />
        </View>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Strain"
            value={stats.strain.toFixed(1)}
          />
          <StatCard
            title="HR Zone"
            value={heartRateZone.zone}
            color={heartRateZone.color}
          />
        </View>
      </View>

      {/* Heart Rate Visualization */}
      <View style={styles.heartRateSection}>
        <View style={styles.heartRateContainer}>
          <View style={styles.heartRateHeader}>
            <Ionicons name="heart" size={20} color={heartRateZone.color} />
            <Text style={styles.heartRateTitle}>Heart Rate</Text>
          </View>
          <View style={styles.heartRateDisplay}>
            <Text style={[styles.heartRateValue, { color: heartRateZone.color }]}>
              {Math.round(stats.heartRate)}
            </Text>
            <Text style={styles.heartRateUnit}>BPM</Text>
          </View>
          <Text style={[styles.heartRateZone, { color: heartRateZone.color }]}>
            {heartRateZone.zone} Zone
          </Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsSection}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.buttonGradient}>
              <Ionicons name="play" size={32} color="#fff" />
              <Text style={styles.buttonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handlePause}
            >
              <LinearGradient 
                colors={isPaused ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']} 
                style={styles.controlButtonGradient}
              >
                <Ionicons 
                  name={isPaused ? 'play' : 'pause'} 
                  size={24} 
                  color="#fff" 
                />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={handleStop}
            >
              <LinearGradient 
                colors={['#EF4444', '#DC2626']} 
                style={styles.controlButtonGradient}
              >
                <Ionicons name="stop" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="water" size={20} color="#06B6D4" />
          <Text style={styles.quickActionText}>Water</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="musical-notes" size={20} color="#8B5CF6" />
          <Text style={styles.quickActionText}>Music</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="settings" size={20} color="#6B7280" />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  timerSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  timerContainer: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  timerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  heartRateSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heartRateContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartRateTitle: {
    fontSize: 16,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  heartRateDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  heartRateValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  heartRateUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  heartRateZone: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    borderRadius: 16,
  },
  buttonGradient: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    borderRadius: 16,
  },
  controlButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  quickAction: {
    alignItems: 'center',
    padding: 15,
  },
  quickActionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default LiveSessionScreen;