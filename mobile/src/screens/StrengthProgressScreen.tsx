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

interface StrengthData {
  oneRepMax: {
    exercise: string;
    weight: number;
    date: string;
    improvement: number;
    target: number;
  }[];
  strengthProgression: {
    exercise: string;
    data: { date: string; weight: number }[];
    color: string;
  }[];
  volumeByExercise: {
    exercise: string;
    volume: number;
    target: number;
    color: string;
  }[];
  strengthRatios: {
    metric: string;
    value: number;
    benchmark: number;
    status: 'excellent' | 'good' | 'average' | 'needs_work';
  }[];
}

const StrengthProgressScreen: React.FC = () => {
  const [data, setData] = useState<StrengthData | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchStrengthData();
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [selectedExercise]);

  const fetchStrengthData = async () => {
    setRefreshing(true);
    
    // Mock data for premium strength analytics
    setTimeout(() => {
      setData({
        oneRepMax: [
          { exercise: 'Bench Press', weight: 225, date: '2024-01-15', improvement: 15, target: 275 },
          { exercise: 'Squat', weight: 315, date: '2024-01-12', improvement: 20, target: 365 },
          { exercise: 'Deadlift', weight: 405, date: '2024-01-10', improvement: 25, target: 455 },
          { exercise: 'Overhead Press', weight: 155, date: '2024-01-08', improvement: 12, target: 185 },
        ],
        strengthProgression: [
          {
            exercise: 'Bench Press',
            data: [
              { date: 'W1', weight: 185 },
              { date: 'W2', weight: 195 },
              { date: 'W3', weight: 205 },
              { date: 'W4', weight: 215 },
              { date: 'W5', weight: 220 },
              { date: 'W6', weight: 225 },
            ],
            color: '#EF4444',
          },
          {
            exercise: 'Squat',
            data: [
              { date: 'W1', weight: 275 },
              { date: 'W2', weight: 285 },
              { date: 'W3', weight: 295 },
              { date: 'W4', weight: 305 },
              { date: 'W5', weight: 310 },
              { date: 'W6', weight: 315 },
            ],
            color: '#F97316',
          },
        ],
        volumeByExercise: [
          { exercise: 'Bench Press', volume: 8500, target: 10000, color: '#EF4444' },
          { exercise: 'Squat', volume: 12000, target: 12000, color: '#F97316' },
          { exercise: 'Deadlift', volume: 9500, target: 10000, color: '#22C55E' },
          { exercise: 'Overhead Press', volume: 6500, target: 8000, color: '#3B82F6' },
        ],
        strengthRatios: [
          { metric: 'Squat/BW', value: 2.1, benchmark: 2.0, status: 'excellent' },
          { metric: 'Bench/BW', value: 1.4, benchmark: 1.5, status: 'good' },
          { metric: 'Deadlift/BW', value: 2.7, benchmark: 2.5, status: 'excellent' },
          { metric: 'Total/BW', value: 6.2, benchmark: 6.0, status: 'excellent' },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderOneRepMaxChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>One Rep Max Progress</Text>
      <View style={styles.ormChart}>
        <Svg width={width - 80} height={250}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4].map((i) => (
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
          
          {/* ORM bars with targets */}
          {data?.oneRepMax.map((orm, index) => (
            <React.Fragment key={index}>
              {/* Target line */}
              <Line
                x1={30 + index * 70}
                y1={50 + (500 - orm.target) * 0.3}
                x2={70 + index * 70}
                y2={50 + (500 - orm.target) * 0.3}
                stroke="#EAB308"
                strokeWidth={2}
                strokeDasharray="3,3"
              />
              
              {/* Current weight bar */}
              <Rect
                x={35 + index * 70}
                y={50 + (500 - orm.weight) * 0.3}
                width={30}
                height={(orm.weight / 500) * 120}
                fill={`url(#${orm.exercise.replace(' ', '')}Gradient)`}
                rx={4}
              />
              
              {/* Exercise label */}
              <SvgText
                x={50 + index * 70}
                y={220}
                fontSize={10}
                textAnchor="middle"
                fill="#666"
              >
                {orm.exercise.split(' ')[0]}
              </SvgText>
              
              {/* Weight value */}
              <SvgText
                x={50 + index * 70}
                y={235}
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {orm.weight}
              </SvgText>
            </React.Fragment>
          ))}
          
          {/* Gradients */}
          <Defs>
            <SvgLinearGradient id="BenchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#DC2626" />
            </SvgLinearGradient>
            <SvgLinearGradient id="SquatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F97316" />
              <Stop offset="100%" stopColor="#EA580C" />
            </SvgLinearGradient>
            <SvgLinearGradient id="DeadliftGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#22C55E" />
              <Stop offset="100%" stopColor="#16A34A" />
            </SvgLinearGradient>
            <SvgLinearGradient id="OverheadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#2563EB" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      </View>
    </View>
  );

  const renderStrengthProgressionChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Strength Progression</Text>
      <View style={styles.progressionChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={40 + i * 30}
              x2={width - 80}
              y2={40 + i * 30}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
          {/* Progression lines */}
          {data?.strengthProgression.map((progression, index) => (
            <React.Fragment key={index}>
              {/* Line path */}
              <Path
                d={progression.data.map((point, i) => {
                  const x = 30 + i * 50;
                  const y = 40 + (400 - point.weight) * 0.3;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke={progression.color}
                strokeWidth={3}
                fill="transparent"
              />
              
              {/* Data points */}
              {progression.data.map((point, i) => (
                <Circle
                  key={i}
                  cx={30 + i * 50}
                  cy={40 + (400 - point.weight) * 0.3}
                  r={4}
                  fill={progression.color}
                />
              ))}
            </React.Fragment>
          ))}
          
          {/* Week labels */}
          {data?.strengthProgression[0]?.data.map((point, index) => (
            <SvgText
              key={index}
              x={30 + index * 50}
              y={190}
              fontSize={10}
              textAnchor="middle"
              fill="#666"
            >
              {point.date}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );

  const renderVolumeProgressRings = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Volume Progress by Exercise</Text>
      <View style={styles.volumeRingsContainer}>
        {data?.volumeByExercise.map((exercise, index) => (
          <View key={index} style={styles.volumeRing}>
            <Svg width={100} height={100}>
              <Circle
                cx={50}
                cy={50}
                r={40}
                stroke="#E5E7EB"
                strokeWidth={8}
                fill="transparent"
              />
              <Circle
                cx={50}
                cy={50}
                r={40}
                stroke={exercise.color}
                strokeWidth={8}
                fill="transparent"
                strokeDasharray={`${(exercise.volume / exercise.target) * 251} 251`}
                strokeDashoffset={63}
                transform={`rotate(-90 50 50)`}
              />
            </Svg>
            <Text style={styles.exerciseName}>{exercise.exercise}</Text>
            <Text style={styles.volumeProgress}>
              {Math.round((exercise.volume / exercise.target) * 100)}%
            </Text>
            <Text style={styles.volumeValue}>{exercise.volume.toLocaleString()} kg</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStrengthRatios = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Strength Ratios</Text>
      <View style={styles.ratiosContainer}>
        {data?.strengthRatios.map((ratio, index) => (
          <LinearGradient
            key={index}
            colors={getStatusColors(ratio.status)}
            style={styles.ratioCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.ratioHeader}>
              <Text style={styles.ratioMetric}>{ratio.metric}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ratio.status) }]}>
                <Text style={styles.statusText}>{ratio.status}</Text>
              </View>
            </View>
            <Text style={styles.ratioValue}>{ratio.value}</Text>
            <Text style={styles.ratioBenchmark}>Benchmark: {ratio.benchmark}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'excellent':
        return ['#22C55E', '#16A34A'];
      case 'good':
        return ['#3B82F6', '#2563EB'];
      case 'average':
        return ['#F59E0B', '#D97706'];
      case 'needs_work':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#22C55E';
      case 'good':
        return '#3B82F6';
      case 'average':
        return '#F59E0B';
      case 'needs_work':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchStrengthData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={[
          styles.header, 
          { 
            transform: [{ 
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, 0],
              })
            }] 
          }
        ]}
      >
        <Text style={styles.title}>Strength Progress</Text>
        <Text style={styles.subtitle}>Track your strength gains</Text>
        
        {/* Exercise Filter */}
        <View style={styles.exerciseFilter}>
          {['all', 'bench', 'squat', 'deadlift', 'overhead'].map((exercise) => (
            <TouchableOpacity
              key={exercise}
              style={[
                styles.filterButton,
                selectedExercise === exercise && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedExercise(exercise)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedExercise === exercise && styles.filterTextActive,
                ]}
              >
                {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {renderOneRepMaxChart()}
      {renderStrengthProgressionChart()}
      {renderVolumeProgressRings()}
      {renderStrengthRatios()}
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
  exerciseFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
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
  ormChart: {
    alignItems: 'center',
  },
  progressionChart: {
    alignItems: 'center',
  },
  volumeRingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  volumeRing: {
    alignItems: 'center',
    marginBottom: 20,
    width: '45%',
  },
  exerciseName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  volumeProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  volumeValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratiosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  ratioCard: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratioMetric: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ratioValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  ratioBenchmark: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
});

export default StrengthProgressScreen;