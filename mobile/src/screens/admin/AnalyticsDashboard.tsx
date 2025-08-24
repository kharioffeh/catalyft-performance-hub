import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    churnRate: number;
  };
  engagementMetrics: {
    dailyActiveUsers: number[];
    averageSessionDuration: number;
    sessionsPerUser: number;
    screenViews: { screen: string; views: number }[];
  };
  conversionMetrics: {
    trialToPayingRate: number;
    subscriptionRevenue: number;
    averageRevenuePerUser: number;
    lifetimeValue: number;
  };
  retentionMetrics: {
    day1: number;
    day7: number;
    day30: number;
    cohorts: { week: string; retention: number[] }[];
  };
  featureAdoption: {
    feature: string;
    adoption: number;
    usage: number;
  }[];
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'engagement' | 'revenue' | 'retention'>('users');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setRefreshing(true);
    
    // TODO: Fetch from backend
    // Mock data for now
    setTimeout(() => {
      setData({
        userMetrics: {
          totalUsers: 15420,
          activeUsers: 8234,
          newUsers: 1245,
          churnRate: 5.2,
        },
        engagementMetrics: {
          dailyActiveUsers: [3200, 3400, 3100, 3500, 3800, 4100, 4200],
          averageSessionDuration: 28.5,
          sessionsPerUser: 4.2,
          screenViews: [
            { screen: 'Dashboard', views: 45320 },
            { screen: 'Workout', views: 38450 },
            { screen: 'Progress', views: 28930 },
            { screen: 'Social', views: 22140 },
            { screen: 'Nutrition', views: 18760 },
          ],
        },
        conversionMetrics: {
          trialToPayingRate: 32.5,
          subscriptionRevenue: 154320,
          averageRevenuePerUser: 12.45,
          lifetimeValue: 89.30,
        },
        retentionMetrics: {
          day1: 78.5,
          day7: 52.3,
          day30: 34.2,
          cohorts: [
            { week: 'Week 1', retention: [100, 78, 65, 52, 45, 38, 34] },
            { week: 'Week 2', retention: [100, 82, 68, 55, 48, 42, 38] },
            { week: 'Week 3', retention: [100, 75, 62, 48, 42, 35, 32] },
            { week: 'Week 4', retention: [100, 80, 70, 58, 50, 45, 40] },
          ],
        },
        featureAdoption: [
          { feature: 'AI Coach', adoption: 68, usage: 4.2 },
          { feature: 'Social Feed', adoption: 45, usage: 2.8 },
          { feature: 'Meal Tracking', adoption: 38, usage: 3.5 },
          { feature: 'Progress Photos', adoption: 52, usage: 1.2 },
          { feature: 'Challenges', adoption: 34, usage: 2.1 },
        ],
      });
      setRefreshing(false);
    }, 1500);
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    change: number,
    icon: string,
    color: string
  ) => (
    <LinearGradient
      colors={[color, `${color}DD`]}
      style={styles.metricCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color="white" />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricChange}>
        <Ionicons
          name={change >= 0 ? 'trending-up' : 'trending-down'}
          size={16}
          color="white"
        />
        <Text style={styles.metricChangeText}>
          {change >= 0 ? '+' : ''}{change}%
        </Text>
      </View>
    </LinearGradient>
  );

  const renderUserMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>User Metrics</Text>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Total Users',
          data?.userMetrics.totalUsers.toLocaleString() || '0',
          12.5,
          'people',
          '#6C63FF'
        )}
        {renderMetricCard(
          'Active Users',
          data?.userMetrics.activeUsers.toLocaleString() || '0',
          8.3,
          'fitness',
          '#4ECDC4'
        )}
        {renderMetricCard(
          'New Users',
          data?.userMetrics.newUsers.toLocaleString() || '0',
          15.2,
          'person-add',
          '#FFD93D'
        )}
        {renderMetricCard(
          'Churn Rate',
          `${data?.userMetrics.churnRate || 0}%`,
          -2.1,
          'exit',
          '#FF6B6B'
        )}
      </View>
    </View>
  );

  const renderEngagementChart = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Active Users</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                data: data?.engagementMetrics.dailyActiveUsers || [0],
              },
            ],
          }}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#FFF',
            backgroundGradientFrom: '#FFF',
            backgroundGradientTo: '#FFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#6C63FF',
            },
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );

  const renderRetentionCohorts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Retention Cohorts</Text>
      <View style={styles.retentionContainer}>
        <View style={styles.retentionHeader}>
          <Text style={styles.retentionLabel}>Day 1</Text>
          <Text style={styles.retentionValue}>{data?.retentionMetrics.day1}%</Text>
        </View>
        <View style={styles.retentionHeader}>
          <Text style={styles.retentionLabel}>Day 7</Text>
          <Text style={styles.retentionValue}>{data?.retentionMetrics.day7}%</Text>
        </View>
        <View style={styles.retentionHeader}>
          <Text style={styles.retentionLabel}>Day 30</Text>
          <Text style={styles.retentionValue}>{data?.retentionMetrics.day30}%</Text>
        </View>
      </View>
    </View>
  );

  const renderFeatureAdoption = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Feature Adoption</Text>
      {data?.featureAdoption.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Text style={styles.featureName}>{feature.feature}</Text>
            <Text style={styles.featureUsage}>
              {feature.usage} uses/user/week
            </Text>
          </View>
          <View style={styles.featureAdoptionBar}>
            <View
              style={[
                styles.featureAdoptionFill,
                { width: `${feature.adoption}%` },
              ]}
            />
            <Text style={styles.featureAdoptionText}>{feature.adoption}%</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRevenueMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Revenue Metrics</Text>
      <View style={styles.revenueGrid}>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Monthly Revenue</Text>
          <Text style={styles.revenueValue}>
            ${data?.conversionMetrics.subscriptionRevenue.toLocaleString()}
          </Text>
        </View>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>ARPU</Text>
          <Text style={styles.revenueValue}>
            ${data?.conversionMetrics.averageRevenuePerUser.toFixed(2)}
          </Text>
        </View>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>LTV</Text>
          <Text style={styles.revenueValue}>
            ${data?.conversionMetrics.lifetimeValue.toFixed(2)}
          </Text>
        </View>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Conversion Rate</Text>
          <Text style={styles.revenueValue}>
            {data?.conversionMetrics.trialToPayingRate}%
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchAnalytics} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <View style={styles.timeRangeContainer}>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {renderUserMetrics()}
      {renderEngagementChart()}
      {renderRetentionCohorts()}
      {renderFeatureAdoption()}
      {renderRevenueMetrics()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingBottom: 30,
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
    marginBottom: 15,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  timeRangeButtonActive: {
    backgroundColor: '#6C63FF',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: 'white',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  retentionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
  },
  retentionHeader: {
    alignItems: 'center',
  },
  retentionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  retentionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureUsage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  featureAdoptionBar: {
    width: 120,
    height: 30,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  featureAdoptionFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4ECDC4',
  },
  featureAdoptionText: {
    position: 'absolute',
    right: 10,
    top: 7,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  revenueCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AnalyticsDashboard;