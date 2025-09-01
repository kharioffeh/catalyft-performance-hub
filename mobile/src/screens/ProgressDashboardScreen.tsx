import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Rect, Line, Path, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ProgressData {
  strengthProgress: {
    bench: number;
    squat: number;
    deadlift: number;
    overhead: number;
  };
  volumeProgress: {
    week: string;
    volume: number;
    target: number;
  }[];
  muscleGrowth: {
    muscle: string;
    current: number;
    target: number;
    color: string;
  }[];
  personalRecords: {
    exercise: string;
    weight: number;
    date: string;
    improvement: number;
  }[];
}

const ProgressDashboardScreen: React.FC = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchProgressData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const fetchProgressData = async () => {
    setRefreshing(true);
    
    // Mock data for premium analytics
    setTimeout(() => {
      setData({
        strengthProgress: {
          bench: 225,
          squat: 315,
          deadlift: 405,
          overhead: 155,
        },
        volumeProgress: [
          { week: 'W1', volume: 12500, target: 15000 },
          { week: 'W2', volume: 13800, target: 15000 },
          { week: 'W3', volume: 14200, target: 15000 },
          { week: 'W4', volume: 15600, target: 15000 },
          { week: 'W5', volume: 14800, target: 15000 },
          { week: 'W6', volume: 16200, target: 15000 },
        ],
        muscleGrowth: [
          { muscle: 'Chest', current: 85, target: 100, color: '#EF4444' },
          { muscle: 'Back', current: 78, target: 100, color: '#F97316' },
          { muscle: 'Shoulders', current: 72, target: 100, color: '#EAB308' },
          { muscle: 'Legs', current: 91, target: 100, color: '#22C55E' },
          { muscle: 'Arms', current: 68, target: 100, color: '#3B82F6' },
        ],
        personalRecords: [
          { exercise: 'Bench Press', weight: 225, date: '2024-01-15', improvement: 15 },
          { exercise: 'Squat', weight: 315, date: '2024-01-12', improvement: 20 },
          { exercise: 'Deadlift', weight: 405, date: '2024-01-10', improvement: 25 },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderStrengthProgressChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Strength Progress</Text>
      <View style={styles.strengthChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 40}
              x2={width - 80}
              y2={50 + i * 40}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
          {/* Strength bars */}
          <Rect
            x={20}
            y={180 - (data?.strengthProgress.bench || 0) * 0.4}
            width={60}
            height={(data?.strengthProgress.bench || 0) * 0.4}
            fill="url(#benchGradient)"
            rx={8}
          />
          <Rect
            x={100}
            y={180 - (data?.strengthProgress.squat || 0) * 0.4}
            width={60}
            height={(data?.strengthProgress.squat || 0) * 0.4}
            fill="url(#squatGradient)"
            rx={8}
          />
          <Rect
            x={180}
            y={180 - (data?.strengthProgress.deadlift || 0) * 0.4}
            width={60}
            height={(data?.strengthProgress.deadlift || 0) * 0.4}
            fill="url(#deadliftGradient)"
            rx={8}
          />
          <Rect
            x={260}
            y={180 - (data?.strengthProgress.overhead || 0) * 0.4}
            width={60}
            height={(data?.strengthProgress.overhead || 0) * 0.4}
            fill="url(#overheadGradient)"
            rx={8}
          />
          
          {/* Labels */}
          <SvgText x={50} y={200} fontSize={12} textAnchor="middle" fill="#666">Bench</SvgText>
          <SvgText x={130} y={200} fontSize={12} textAnchor="middle" fill="#666">Squat</SvgText>
          <SvgText x={210} y={200} fontSize={12} textAnchor="middle" fill="#666">Deadlift</SvgText>
          <SvgText x={290} y={200} fontSize={12} textAnchor="middle" fill="#666">OHP</SvgText>
          
          {/* Gradients */}
          <Defs>
            <SvgLinearGradient id="benchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#DC2626" />
            </SvgLinearGradient>
            <SvgLinearGradient id="squatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F97316" />
              <Stop offset="100%" stopColor="#EA580C" />
            </SvgLinearGradient>
            <SvgLinearGradient id="deadliftGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#22C55E" />
              <Stop offset="100%" stopColor="#16A34A" />
            </SvgLinearGradient>
            <SvgLinearGradient id="overheadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#2563EB" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      </View>
    </View>
  );

  const renderVolumeProgressChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Volume Progress</Text>
      <View style={styles.volumeChart}>
        <Svg width={width - 80} height={200}>
          {/* Target line */}
          <Line
            x1={0}
            y1={50}
            x2={width - 80}
            y2={50}
            stroke="#EAB308"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          
          {/* Volume bars */}
          {data?.volumeProgress.map((week, index) => (
            <Rect
              key={index}
              x={20 + index * 50}
              y={180 - (week.volume / 20000) * 120}
              width={30}
              height={(week.volume / 20000) * 120}
              fill={week.volume >= week.target ? "#22C55E" : "#EF4444"}
              rx={4}
            />
          ))}
          
          {/* Week labels */}
          {data?.volumeProgress.map((week, index) => (
            <SvgText
              key={index}
              x={35 + index * 50}
              y={200}
              fontSize={10}
              textAnchor="middle"
              fill="#666"
            >
              {week.week}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );

  const renderMuscleGrowthRings = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Muscle Growth Progress</Text>
      <View style={styles.muscleRingsContainer}>
        {data?.muscleGrowth.map((muscle, index) => (
          <View key={index} style={styles.muscleRing}>
            <Svg width={80} height={80}>
              <Circle
                cx={40}
                cy={40}
                r={35}
                stroke="#E5E7EB"
                strokeWidth={6}
                fill="transparent"
              />
              <Circle
                cx={40}
                cy={40}
                r={35}
                stroke={muscle.color}
                strokeWidth={6}
                fill="transparent"
                strokeDasharray={`${(muscle.current / muscle.target) * 220} 220`}
                strokeDashoffset={55}
                transform={`rotate(-90 40 40)`}
              />
            </Svg>
            <Text style={styles.muscleName}>{muscle.muscle}</Text>
            <Text style={styles.muscleProgress}>{muscle.current}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPersonalRecords = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Recent Personal Records</Text>
      {data?.personalRecords.map((pr, index) => (
        <LinearGradient
          key={index}
          colors={['#6C63FF', '#4ECDC4']}
          style={styles.prCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.prHeader}>
            <Text style={styles.prExercise}>{pr.exercise}</Text>
            <View style={styles.prImprovement}>
              <Ionicons name="trending-up" size={16} color="white" />
              <Text style={styles.prImprovementText}>+{pr.improvement}%</Text>
            </View>
          </View>
          <Text style={styles.prWeight}>{pr.weight} lbs</Text>
          <Text style={styles.prDate}>{pr.date}</Text>
        </LinearGradient>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchProgressData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Progress Dashboard</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {renderStrengthProgressChart()}
      {renderVolumeProgressChart()}
      {renderMuscleGrowthRings()}
      {renderPersonalRecords()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  periodButtonActive: {
    backgroundColor: '#6C63FF',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: 'white',
  },
  chartSection: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  strengthChart: {
    alignItems: 'center',
  },
  volumeChart: {
    alignItems: 'center',
  },
  muscleRingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  muscleRing: {
    alignItems: 'center',
    marginBottom: 20,
  },
  muscleName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  muscleProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  prCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  prImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  prImprovementText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  prWeight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  prDate: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
});

export default ProgressDashboardScreen;