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
import { Svg, Circle, Rect, Line, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface WorkoutStatsData {
  workoutFrequency: {
    week: string;
    workouts: number;
    target: number;
  }[];
  workoutDuration: {
    week: string;
    duration: number;
    target: number;
  }[];
  caloriesBurned: {
    week: string;
    calories: number;
    target: number;
  }[];
  workoutTypes: {
    type: string;
    count: number;
    color: string;
  }[];
  performanceMetrics: {
    metric: string;
    value: number;
    previous: number;
    improvement: number;
    unit: string;
  }[];
  weeklyProgress: {
    week: string;
    strength: number;
    cardio: number;
    flexibility: number;
  }[];
}

const WorkoutStatsScreen: React.FC = () => {
  const [data, setData] = useState<WorkoutStatsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [bounceAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchWorkoutStatsData();
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const fetchWorkoutStatsData = async () => {
    setRefreshing(true);
    
    // Mock data for premium workout statistics analytics
    setTimeout(() => {
      setData({
        workoutFrequency: [
          { week: 'W1', workouts: 4, target: 5 },
          { week: 'W2', workouts: 5, target: 5 },
          { week: 'W3', workouts: 6, target: 5 },
          { week: 'W4', workouts: 4, target: 5 },
          { week: 'W5', workouts: 5, target: 5 },
          { week: 'W6', workouts: 7, target: 5 },
        ],
        workoutDuration: [
          { week: 'W1', duration: 45, target: 60 },
          { week: 'W2', duration: 52, target: 60 },
          { week: 'W3', duration: 58, target: 60 },
          { week: 'W4', duration: 48, target: 60 },
          { week: 'W5', duration: 55, target: 60 },
          { week: 'W6', duration: 62, target: 60 },
        ],
        caloriesBurned: [
          { week: 'W1', calories: 320, target: 400 },
          { week: 'W2', calories: 380, target: 400 },
          { week: 'W3', calories: 420, target: 400 },
          { week: 'W4', calories: 350, target: 400 },
          { week: 'W5', calories: 390, target: 400 },
          { week: 'W6', calories: 450, target: 400 },
        ],
        workoutTypes: [
          { type: 'Strength', count: 18, color: '#EF4444' },
          { type: 'Cardio', count: 12, color: '#22C55E' },
          { type: 'Flexibility', count: 8, color: '#3B82F6' },
          { type: 'HIIT', count: 6, color: '#F59E0B' },
        ],
        performanceMetrics: [
          { metric: 'Avg Workout Time', value: 53, previous: 48, improvement: 10.4, unit: 'min' },
          { metric: 'Total Workouts', value: 44, previous: 38, improvement: 15.8, unit: '' },
          { metric: 'Calories Burned', value: 2310, previous: 1980, improvement: 16.7, unit: 'kcal' },
          { metric: 'Workout Streak', value: 12, previous: 8, improvement: 50.0, unit: 'days' },
        ],
        weeklyProgress: [
          { week: 'W1', strength: 75, cardio: 60, flexibility: 40 },
          { week: 'W2', strength: 78, cardio: 65, flexibility: 45 },
          { week: 'W3', strength: 82, cardio: 70, flexibility: 50 },
          { week: 'W4', strength: 80, cardio: 68, flexibility: 48 },
          { week: 'W5', strength: 85, cardio: 75, flexibility: 55 },
          { week: 'W6', strength: 88, cardio: 78, flexibility: 58 },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderWorkoutFrequencyChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Workout Frequency</Text>
      <View style={styles.frequencyChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 20}
              x2={width - 80}
              y2={50 + i * 20}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
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
          
          {/* Frequency bars */}
          {data?.workoutFrequency.map((week, index) => (
            <React.Fragment key={index}>
              <Rect
                x={20 + index * 50}
                y={50 - (week.workouts / 8) * 120}
                width={30}
                height={(week.workouts / 8) * 120}
                fill={week.workouts >= week.target ? "#22C55E" : "#EF4444"}
                rx={4}
              />
              
              {/* Week label */}
              <SvgText
                x={35 + index * 50}
                y={190}
                fontSize={10}
                textAnchor="middle"
                fill="#666"
              >
                {week.week}
              </SvgText>
              
              {/* Workout count */}
              <SvgText
                x={35 + index * 50}
                y={205}
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {week.workouts}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );

  const renderWorkoutDurationChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Workout Duration</Text>
      <View style={styles.durationChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 25}
              x2={width - 80}
              y2={50 + i * 25}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
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
          
          {/* Duration line */}
          <Path
            d={data?.workoutDuration.map((week, i) => {
              const x = 30 + i * 50;
              const y = 50 - (week.duration / 80) * 120;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#6C63FF"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Data points */}
          {data?.workoutDuration.map((week, i) => (
            <Circle
              key={i}
              cx={30 + i * 50}
              cy={50 - (week.duration / 80) * 120}
              r={5}
              fill="#6C63FF"
            />
          ))}
          
          {/* Week labels */}
          {data?.workoutDuration.map((week, index) => (
            <SvgText
              key={index}
              x={30 + index * 50}
              y={190}
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

  const renderCaloriesBurnedChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Calories Burned</Text>
      <View style={styles.caloriesChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 30}
              x2={width - 80}
              y2={50 + i * 30}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
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
          
          {/* Calories bars */}
          {data?.caloriesBurned.map((week, index) => (
            <React.Fragment key={index}>
              <Rect
                x={20 + index * 50}
                y={50 - (week.calories / 500) * 120}
                width={30}
                height={(week.calories / 500) * 120}
                fill={week.calories >= week.target ? "#22C55E" : "#EF4444"}
                rx={4}
              />
              
              {/* Week label */}
              <SvgText
                x={35 + index * 50}
                y={190}
                fontSize={10}
                textAnchor="middle"
                fill="#666"
              >
                {week.week}
              </SvgText>
              
              {/* Calories value */}
              <SvgText
                x={35 + index * 50}
                y={205}
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {week.calories}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );

  const renderWorkoutTypesPie = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Workout Type Distribution</Text>
      <View style={styles.pieChart}>
        <Svg width={200} height={200}>
          {/* Calculate total for percentages */}
          {(() => {
            const total = data?.workoutTypes.reduce((sum, type) => sum + type.count, 0) || 0;
            let currentAngle = 0;
            
            return data?.workoutTypes.map((type, index) => {
              const percentage = (type.count / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 100 + 60 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 100 + 60 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 100 + 60 * Math.cos((currentAngle - 90) * Math.PI / 180);
              const y2 = 100 + 60 * Math.sin((currentAngle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              return (
                <Path
                  key={index}
                  d={`M 100 100 L ${x1} ${y1} A 60 60 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={type.color}
                />
              );
            });
          })()}
        </Svg>
        
        <View style={styles.pieLegend}>
          {data?.workoutTypes.map((type, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: type.color }]} />
              <Text style={styles.legendText}>{type.type}: {type.count}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPerformanceMetrics = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Performance Metrics</Text>
      <View style={styles.metricsGrid}>
        {data?.performanceMetrics.map((metric, index) => (
          <LinearGradient
            key={index}
            colors={['#6C63FF', '#4ECDC4']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.metricLabel}>{metric.metric}</Text>
            <Text style={styles.metricValue}>{metric.value}{metric.unit}</Text>
            <View style={styles.metricImprovement}>
              <Ionicons name="trending-up" size={16} color="white" />
              <Text style={styles.improvementText}>+{metric.improvement}%</Text>
            </View>
          </LinearGradient>
        ))}
      </View>
    </View>
  );

  const renderWeeklyProgressChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Weekly Progress</Text>
      <View style={styles.progressChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
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
          
          {/* Strength line */}
          <Path
            d={data?.weeklyProgress.map((week, i) => {
              const x = 30 + i * 50;
              const y = 40 + (100 - week.strength) * 1.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#EF4444"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Cardio line */}
          <Path
            d={data?.weeklyProgress.map((week, i) => {
              const x = 30 + i * 50;
              const y = 40 + (100 - week.cardio) * 1.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#22C55E"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Flexibility line */}
          <Path
            d={data?.weeklyProgress.map((week, i) => {
              const x = 30 + i * 50;
              const y = 40 + (100 - week.flexibility) * 1.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#3B82F6"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Week labels */}
          {data?.weeklyProgress.map((week, index) => (
            <SvgText
              key={index}
              x={30 + index * 50}
              y={190}
              fontSize={10}
              textAnchor="middle"
              fill="#666"
            >
              {week.week}
            </SvgText>
          ))}
        </Svg>
        
        <View style={styles.progressLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Strength</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Cardio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Flexibility</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchWorkoutStatsData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={[
          styles.header, 
          { 
            transform: [{ 
              scale: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }] 
          }
        ]}
      >
        <Text style={styles.title}>Workout Statistics</Text>
        <Text style={styles.subtitle}>Track your training progress</Text>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'quarter'] as const).map((period) => (
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

      {renderWorkoutFrequencyChart()}
      {renderWorkoutDurationChart()}
      {renderCaloriesBurnedChart()}
      {renderWorkoutTypesPie()}
      {renderPerformanceMetrics()}
      {renderWeeklyProgressChart()}
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
  frequencyChart: {
    alignItems: 'center',
  },
  durationChart: {
    alignItems: 'center',
  },
  caloriesChart: {
    alignItems: 'center',
  },
  pieChart: {
    alignItems: 'center',
  },
  pieLegend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  metricLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  metricImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  improvementText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  progressChart: {
    alignItems: 'center',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
});

export default WorkoutStatsScreen;