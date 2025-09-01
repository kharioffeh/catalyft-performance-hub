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
import { Svg, Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface BodyMetricsData {
  weight: {
    current: number;
    previous: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    unit: string;
  };
  bodyFat: {
    current: number;
    previous: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    unit: string;
  };
  muscleMass: {
    current: number;
    previous: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    unit: string;
  };
  measurements: {
    chest: { current: number; previous: number; unit: string };
    waist: { current: number; previous: number; unit: string };
    arms: { current: number; previous: number; unit: string };
    legs: { current: number; previous: number; unit: string };
  };
  bodyComposition: {
    fat: number;
    muscle: number;
    bone: number;
    water: number;
  };
  progressHistory: {
    date: string;
    weight: number;
    bodyFat: number;
    muscleMass: number;
  }[];
}

const BodyMetricsScreen: React.FC = () => {
  const [data, setData] = useState<BodyMetricsData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchBodyMetricsData();
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [selectedMetric]);

  const fetchBodyMetricsData = async () => {
    setRefreshing(true);
    
    // Mock data for premium body metrics analytics
    setTimeout(() => {
      setData({
        weight: {
          current: 175,
          previous: 180,
          target: 170,
          trend: 'down',
          unit: 'lbs',
        },
        bodyFat: {
          current: 15.2,
          previous: 16.8,
          target: 12.0,
          trend: 'down',
          unit: '%',
        },
        muscleMass: {
          current: 145,
          previous: 142,
          target: 150,
          trend: 'up',
          unit: 'lbs',
        },
        measurements: {
          chest: { current: 42, previous: 41.5, unit: 'in' },
          waist: { current: 32, previous: 33, unit: 'in' },
          arms: { current: 15.5, previous: 15.2, unit: 'in' },
          legs: { current: 24, previous: 23.5, unit: 'in' },
        },
        bodyComposition: {
          fat: 15.2,
          muscle: 65.8,
          bone: 3.5,
          water: 15.5,
        },
        progressHistory: [
          { date: 'Week 1', weight: 180, bodyFat: 16.8, muscleMass: 142 },
          { date: 'Week 2', weight: 178, bodyFat: 16.2, muscleMass: 143 },
          { date: 'Week 3', weight: 176, bodyFat: 15.8, muscleMass: 144 },
          { date: 'Week 4', weight: 175, bodyFat: 15.2, muscleMass: 145 },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'remove';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#22C55E';
      case 'down':
        return '#EF4444';
      case 'stable':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getMetricCard = (
    title: string,
    current: number,
    previous: number,
    target: number,
    trend: string,
    unit: string,
    icon: string,
    color: string
  ) => {
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    const progressToTarget = target > 0 ? (current / target) * 100 : 0;

    return (
      <LinearGradient
        colors={[color, `${color}DD`]}
        style={styles.metricCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.metricHeader}>
          <Ionicons name={icon as any} size={24} color="white" />
          <Text style={styles.metricTitle}>{title}</Text>
          <View style={[styles.trendContainer, { backgroundColor: getTrendColor(trend) }]}>
            <Ionicons name={getTrendIcon(trend) as any} size={16} color="white" />
          </View>
        </View>
        
        <Text style={styles.metricValue}>{current}{unit}</Text>
        
        <View style={styles.metricDetails}>
          <Text style={styles.metricChange}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}{unit} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
          </Text>
          <Text style={styles.metricTarget}>Target: {target}{unit}</Text>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progressToTarget, 100)}%`,
                backgroundColor: progressToTarget >= 100 ? '#22C55E' : 'rgba(255,255,255,0.3)'
              }
            ]} 
          />
        </View>
      </LinearGradient>
    );
  };

  const renderBodyCompositionChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Body Composition</Text>
      <View style={styles.compositionChart}>
        <Svg width={200} height={200}>
          {/* Background circle */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#E5E7EB"
            strokeWidth={20}
            fill="transparent"
          />
          
          {/* Fat */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#EF4444"
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.bodyComposition.fat || 0) * 5.03} 503`}
            strokeDashoffset={503}
            transform={`rotate(-90 100 100)`}
          />
          
          {/* Muscle */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#22C55E"
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.bodyComposition.muscle || 0) * 5.03} 503`}
            strokeDashoffset={503 - (data?.bodyComposition.fat || 0) * 5.03}
            transform={`rotate(-90 100 100)`}
          />
          
          {/* Bone */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#F59E0B"
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.bodyComposition.bone || 0) * 5.03} 503`}
            strokeDashoffset={503 - ((data?.bodyComposition.fat || 0) + (data?.bodyComposition.muscle || 0)) * 5.03}
            transform={`rotate(-90 100 100)`}
          />
          
          {/* Water */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#3B82F6"
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.bodyComposition.water || 0) * 5.03} 503`}
            strokeDashoffset={503 - ((data?.bodyComposition.fat || 0) + (data?.bodyComposition.muscle || 0) + (data?.bodyComposition.bone || 0)) * 5.03}
            transform={`rotate(-90 100 100)`}
          />
        </Svg>
        
        <View style={styles.compositionLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Fat: {data?.bodyComposition.fat}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Muscle: {data?.bodyComposition.muscle}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Bone: {data?.bodyComposition.bone}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Water: {data?.bodyComposition.water}%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderProgressChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Progress Over Time</Text>
      <View style={styles.progressChart}>
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
          
          {/* Weight line */}
          <Path
            d={data?.progressHistory.map((point, i) => {
              const x = 30 + i * 60;
              const y = 50 + (200 - point.weight) * 0.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#EF4444"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Body fat line */}
          <Path
            d={data?.progressHistory.map((point, i) => {
              const x = 30 + i * 60;
              const y = 50 + (point.bodyFat * 8);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#F59E0B"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Week labels */}
          {data?.progressHistory.map((point, index) => (
            <SvgText
              key={index}
              x={30 + index * 60}
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchBodyMetricsData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={[
          styles.header, 
          { 
            transform: [{ 
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              })
            }] 
          }
        ]}
      >
        <Text style={styles.title}>Body Metrics</Text>
        <Text style={styles.subtitle}>Track your physical progress</Text>
        
        {/* Metric Filter */}
        <View style={styles.metricFilter}>
          {['overview', 'composition', 'measurements', 'progress'].map((metric) => (
            <TouchableOpacity
              key={metric}
              style={[
                styles.filterButton,
                selectedMetric === metric && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedMetric(metric)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedMetric === metric && styles.filterTextActive,
                ]}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Key Metrics Cards */}
      <View style={styles.metricsGrid}>
        {data && (
          <>
            {getMetricCard(
              'Weight',
              data.weight.current,
              data.weight.previous,
              data.weight.target,
              data.weight.trend,
              data.weight.unit,
              'scale',
              '#6C63FF'
            )}
            {getMetricCard(
              'Body Fat',
              data.bodyFat.current,
              data.bodyFat.previous,
              data.bodyFat.target,
              data.bodyFat.trend,
              data.bodyFat.unit,
              'body',
              '#EF4444'
            )}
            {getMetricCard(
              'Muscle Mass',
              data.muscleMass.current,
              data.muscleMass.previous,
              data.muscleMass.target,
              data.muscleMass.trend,
              data.muscleMass.unit,
              'fitness',
              '#22C55E'
            )}
          </>
        )}
      </View>

      {/* Measurements Grid */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Body Measurements</Text>
        <View style={styles.measurementsGrid}>
          {data && (
            <>
              <View style={styles.measurementCard}>
                <Ionicons name="body" size={24} color="#6C63FF" />
                <Text style={styles.measurementLabel}>Chest</Text>
                <Text style={styles.measurementValue}>{data.measurements.chest.current}{data.measurements.chest.unit}</Text>
                <View style={styles.measurementTrend}>
                  <Ionicons 
                    name={data.measurements.chest.current > data.measurements.chest.previous ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={data.measurements.chest.current > data.measurements.chest.previous ? '#22C55E' : '#EF4444'} 
                  />
                  <Text style={styles.trendText}>
                    {data.measurements.chest.current > data.measurements.chest.previous ? '+' : ''}
                    {(data.measurements.chest.current - data.measurements.chest.previous).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.measurementCard}>
                <Ionicons name="resize" size={24} color="#F97316" />
                <Text style={styles.measurementLabel}>Waist</Text>
                <Text style={styles.measurementValue}>{data.measurements.waist.current}{data.measurements.waist.unit}</Text>
                <View style={styles.measurementTrend}>
                  <Ionicons 
                    name={data.measurements.waist.current < data.measurements.waist.previous ? 'trending-down' : 'trending-up'} 
                    size={16} 
                    color={data.measurements.waist.current < data.measurements.waist.previous ? '#22C55E' : '#EF4444'} 
                  />
                  <Text style={styles.trendText}>
                    {data.measurements.waist.current < data.measurements.waist.previous ? '-' : '+'}
                    {Math.abs(data.measurements.waist.current - data.measurements.waist.previous).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.measurementCard}>
                <Ionicons name="fitness" size={24} color="#22C55E" />
                <Text style={styles.measurementLabel}>Arms</Text>
                <Text style={styles.measurementValue}>{data.measurements.arms.current}{data.measurements.arms.unit}</Text>
                <View style={styles.measurementTrend}>
                  <Ionicons 
                    name={data.measurements.arms.current > data.measurements.arms.previous ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={data.measurements.arms.current > data.measurements.arms.previous ? '#22C55E' : '#EF4444'} 
                  />
                  <Text style={styles.trendText}>
                    {data.measurements.arms.current > data.measurements.arms.previous ? '+' : ''}
                    {(data.measurements.arms.current - data.measurements.arms.previous).toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.measurementCard}>
                <Ionicons name="walk" size={24} color="#3B82F6" />
                <Text style={styles.measurementLabel}>Legs</Text>
                <Text style={styles.measurementValue}>{data.measurements.legs.current}{data.measurements.legs.unit}</Text>
                <View style={styles.measurementTrend}>
                  <Ionicons 
                    name={data.measurements.legs.current > data.measurements.legs.previous ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={data.measurements.legs.current > data.measurements.legs.previous ? '#22C55E' : '#EF4444'} 
                  />
                  <Text style={styles.trendText}>
                    {data.measurements.legs.current > data.measurements.legs.previous ? '+' : ''}
                    {(data.measurements.legs.current - data.measurements.legs.previous).toFixed(1)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {renderBodyCompositionChart()}
      {renderProgressChart()}
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
  metricFilter: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
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
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  metricTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  trendContainer: {
    padding: 6,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  metricDetails: {
    marginBottom: 15,
  },
  metricChange: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 5,
  },
  metricTarget: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
  compositionChart: {
    alignItems: 'center',
  },
  compositionLegend: {
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
  progressChart: {
    alignItems: 'center',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  measurementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  measurementLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  measurementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  measurementTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default BodyMetricsScreen;