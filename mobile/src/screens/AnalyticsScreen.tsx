import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  strain: number[];
  recovery: number[];
  sleep: number[];
  hrv: number[];
  labels: string[];
}

interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  icon: string;
  color: string;
}

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    strain: [6.2, 8.1, 7.5, 9.2, 6.8, 7.9, 8.3],
    recovery: [78, 65, 72, 58, 81, 69, 76],
    sleep: [7.2, 6.8, 8.1, 6.5, 7.9, 7.3, 8.2],
    hrv: [42, 38, 45, 35, 48, 41, 44],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  const [trends, setTrends] = useState<TrendData[]>([
    {
      metric: 'Avg Strain',
      current: 7.6,
      previous: 7.2,
      change: 5.6,
      unit: '',
      icon: 'flash',
      color: '#F59E0B'
    },
    {
      metric: 'Avg Recovery',
      current: 72,
      previous: 68,
      change: 5.9,
      unit: '%',
      icon: 'heart',
      color: '#10B981'
    },
    {
      metric: 'Avg Sleep',
      current: 7.4,
      previous: 7.1,
      change: 4.2,
      unit: 'hrs',
      icon: 'moon',
      color: '#8B5CF6'
    },
    {
      metric: 'Avg HRV',
      current: 43,
      previous: 41,
      change: 4.9,
      unit: 'ms',
      icon: 'pulse',
      color: '#06B6D4'
    }
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#374151',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(209, 213, 219, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const PeriodSelector: React.FC = () => (
    <View style={styles.periodSelector}>
      {(['7d', '30d', '90d'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const TrendCard: React.FC<{ trend: TrendData }> = ({ trend }) => (
    <View style={styles.trendCard}>
      <View style={styles.trendHeader}>
        <Ionicons name={trend.icon as any} size={20} color={trend.color} />
        <Text style={styles.trendMetric}>{trend.metric}</Text>
      </View>
      <View style={styles.trendContent}>
        <Text style={styles.trendValue}>
          {trend.current}{trend.unit}
        </Text>
        <View style={styles.trendChange}>
          <Ionicons 
            name={trend.change > 0 ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={trend.change > 0 ? '#10B981' : '#EF4444'} 
          />
          <Text style={[
            styles.trendChangeText,
            { color: trend.change > 0 ? '#10B981' : '#EF4444' }
          ]}>
            {Math.abs(trend.change).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );

  const MetricOverview: React.FC<{
    title: string;
    value: number;
    unit: string;
    status: 'good' | 'warning' | 'poor';
    onPress: () => void;
  }> = ({ title, value, unit, status, onPress }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'good': return '#10B981';
        case 'warning': return '#F59E0B';
        case 'poor': return '#EF4444';
        default: return '#6B7280';
      }
    };

    return (
      <TouchableOpacity style={styles.metricOverview} onPress={onPress}>
        <View style={styles.metricOverviewContent}>
          <Text style={styles.metricOverviewTitle}>{title}</Text>
          <View style={styles.metricOverviewValue}>
            <Text style={[styles.metricOverviewNumber, { color: getStatusColor() }]}>
              {value}{unit}
            </Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <PeriodSelector />

      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.todaySummary}>
          <MetricOverview
            title="Strain"
            value={8.2}
            unit=""
            status="warning"
            onPress={() => navigation.navigate('StrainDetail')}
          />
          <MetricOverview
            title="Recovery"
            value={76}
            unit="%"
            status="good"
            onPress={() => navigation.navigate('RecoveryDetail')}
          />
          <MetricOverview
            title="Sleep"
            value={7.3}
            unit="h"
            status="good"
            onPress={() => navigation.navigate('SleepDetail')}
          />
        </View>
      </View>

      {/* Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Trends</Text>
        <View style={styles.trendsGrid}>
          {trends.map((trend, index) => (
            <TrendCard key={index} trend={trend} />
          ))}
        </View>
      </View>

      {/* Strain Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Strain Trend</Text>
          <TouchableOpacity onPress={() => navigation.navigate('StrainDetail')}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: analyticsData.labels,
              datasets: [{
                data: analyticsData.strain,
                strokeWidth: 3,
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Recovery Chart */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Recovery %</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecoveryDetail')}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: analyticsData.labels,
              datasets: [{
                data: analyticsData.recovery,
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
      </View>

      {/* Sleep Quality */}
      <View style={styles.section}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Sleep Duration</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SleepDetail')}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: analyticsData.labels,
              datasets: [{
                data: analyticsData.sleep,
                strokeWidth: 3,
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Recovery Recommendation</Text>
              <Text style={styles.insightText}>
                Your strain has been consistently high. Consider taking a rest day to improve recovery.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Sleep Pattern</Text>
              <Text style={styles.insightText}>
                Great job! Your sleep duration has improved by 12% this week.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom padding */}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  todaySummary: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  metricOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  metricOverviewContent: {
    flex: 1,
  },
  metricOverviewTitle: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  metricOverviewValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricOverviewNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendMetric: {
    color: '#D1D5DB',
    fontSize: 14,
    marginLeft: 8,
  },
  trendContent: {
    alignItems: 'flex-start',
  },
  trendValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendChangeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  viewDetailsText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  insightsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  insightCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});

export default AnalyticsScreen;