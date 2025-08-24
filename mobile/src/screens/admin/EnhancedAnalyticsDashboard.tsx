import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AnalyticsValidator from '../../services/analyticsValidator';
import PerformanceMonitor from '../../services/performanceMonitor';
import ABTestingService from '../../services/abTesting';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
    conversionRate: number;
  };
  funnel: {
    step: string;
    users: number;
    dropOff: number;
  }[];
  performance: Record<string, any>;
  abTests: {
    testId: string;
    variants: Record<string, any>;
  }[];
  alerts: DashboardAlert[];
}

interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  metric?: string;
  value?: number;
  threshold?: number;
}

const EnhancedAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'performance' | 'funnel'>('users');
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [alertThresholds, setAlertThresholds] = useState({
    dropOffRate: 20, // Alert if drop-off > 20%
    conversionRate: 10, // Alert if conversion < 10%
    performanceScore: 70, // Alert if score < 70
    errorRate: 5, // Alert if error rate > 5%
  });

  useEffect(() => {
    fetchDashboardData();
    setupAlerts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      checkAlerts();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    
    try {
      // Fetch analytics data
      const analyticsReport = await AnalyticsValidator.getStoredReports();
      const performanceReport = await PerformanceMonitor.getPerformanceReport();
      
      // Mock funnel data (replace with real data)
      const funnelData = [
        { step: 'Welcome', users: 10000, dropOff: 0 },
        { step: 'Goals', users: 8500, dropOff: 15 },
        { step: 'Assessment', users: 6800, dropOff: 20 },
        { step: 'Personalization', users: 5440, dropOff: 20 },
        { step: 'Plan Selection', users: 4352, dropOff: 20 },
        { step: 'Tutorial', users: 3700, dropOff: 15 },
        { step: 'Completed', users: 3330, dropOff: 10 },
      ];
      
      // Get A/B test results
      const abTests = [
        {
          testId: 'cta_button_color',
          variants: ABTestingService.getTestResults('cta_button_color'),
        },
        {
          testId: 'onboarding_welcome_copy',
          variants: ABTestingService.getTestResults('onboarding_welcome_copy'),
        },
      ];
      
      setData({
        overview: {
          totalUsers: 15420,
          activeUsers: 8234,
          revenue: 154320,
          conversionRate: 32.5,
        },
        funnel: funnelData,
        performance: performanceReport,
        abTests,
        alerts: alerts,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setupAlerts = () => {
    // Set up alert rules
    const newAlerts: DashboardAlert[] = [];
    
    // Check conversion rate
    if (data?.overview.conversionRate && data.overview.conversionRate < alertThresholds.conversionRate) {
      newAlerts.push({
        id: 'low_conversion',
        type: 'warning',
        title: 'Low Conversion Rate',
        message: `Conversion rate is ${data.overview.conversionRate}%, below threshold of ${alertThresholds.conversionRate}%`,
        timestamp: Date.now(),
        metric: 'conversion_rate',
        value: data.overview.conversionRate,
        threshold: alertThresholds.conversionRate,
      });
    }
    
    // Check performance score
    if (data?.performance.performance_score && data.performance.performance_score < alertThresholds.performanceScore) {
      newAlerts.push({
        id: 'low_performance',
        type: 'error',
        title: 'Performance Issues Detected',
        message: `Performance score is ${data.performance.performance_score}, below threshold of ${alertThresholds.performanceScore}`,
        timestamp: Date.now(),
        metric: 'performance_score',
        value: data.performance.performance_score,
        threshold: alertThresholds.performanceScore,
      });
    }
    
    setAlerts(newAlerts);
  };

  const checkAlerts = () => {
    setupAlerts();
    
    // Send push notification for critical alerts
    alerts.filter(a => a.type === 'error').forEach(alert => {
      // TODO: Send push notification
      console.log('Critical alert:', alert);
    });
  };

  const exportData = async (format: 'csv' | 'json') => {
    if (!data) return;
    
    try {
      let content = '';
      let filename = '';
      
      if (format === 'csv') {
        // Convert to CSV
        content = convertToCSV(data);
        filename = `analytics_${Date.now()}.csv`;
      } else {
        // Convert to JSON
        content = JSON.stringify(data, null, 2);
        filename = `analytics_${Date.now()}.json`;
      }
      
      // Save to file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', `File saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Export Failed', 'Unable to export analytics data');
    }
  };

  const convertToCSV = (data: DashboardData): string => {
    let csv = 'Metric,Value\n';
    
    // Overview metrics
    csv += `Total Users,${data.overview.totalUsers}\n`;
    csv += `Active Users,${data.overview.activeUsers}\n`;
    csv += `Revenue,$${data.overview.revenue}\n`;
    csv += `Conversion Rate,${data.overview.conversionRate}%\n\n`;
    
    // Funnel data
    csv += 'Funnel Step,Users,Drop-off %\n';
    data.funnel.forEach(step => {
      csv += `${step.step},${step.users},${step.dropOff}%\n`;
    });
    
    return csv;
  };

  const shareReport = async () => {
    const report = generateTextReport();
    
    try {
      await Share.share({
        message: report,
        title: 'Analytics Report',
      });
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  };

  const generateTextReport = (): string => {
    if (!data) return '';
    
    return `
📊 CATALYFT ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

OVERVIEW
--------
Total Users: ${data.overview.totalUsers.toLocaleString()}
Active Users: ${data.overview.activeUsers.toLocaleString()}
Revenue: $${data.overview.revenue.toLocaleString()}
Conversion Rate: ${data.overview.conversionRate}%

FUNNEL ANALYSIS
--------------
${data.funnel.map(s => `${s.step}: ${s.users} users (${s.dropOff}% drop-off)`).join('\n')}

PERFORMANCE
----------
Score: ${data.performance.performance_score || 'N/A'}
Avg Screen Render: ${data.performance.avg_screen_render?.toFixed(0) || 'N/A'}ms
Avg Network Duration: ${data.performance.avg_network_duration?.toFixed(0) || 'N/A'}ms

${alerts.length > 0 ? `
ALERTS (${alerts.length})
------
${alerts.map(a => `⚠️ ${a.title}: ${a.message}`).join('\n')}
` : ''}
    `.trim();
  };

  const renderAlerts = () => (
    <View style={styles.alertsContainer}>
      <Text style={styles.sectionTitle}>
        Alerts ({alerts.length})
        {alerts.length > 0 && (
          <Ionicons name="warning" size={20} color="#FF6B6B" />
        )}
      </Text>
      
      {alerts.length === 0 ? (
        <View style={styles.noAlerts}>
          <Ionicons name="checkmark-circle" size={40} color="#4ECDC4" />
          <Text style={styles.noAlertsText}>All metrics are healthy</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {alerts.map(alert => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                alert.type === 'error' && styles.alertCardError,
                alert.type === 'warning' && styles.alertCardWarning,
              ]}
            >
              <Ionicons
                name={
                  alert.type === 'error' ? 'alert-circle' :
                  alert.type === 'warning' ? 'warning' : 'information-circle'
                }
                size={24}
                color={
                  alert.type === 'error' ? '#FF6B6B' :
                  alert.type === 'warning' ? '#FFD93D' : '#6C63FF'
                }
              />
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              {alert.value !== undefined && (
                <View style={styles.alertMetrics}>
                  <Text style={styles.alertValue}>
                    Current: {alert.value}
                  </Text>
                  <Text style={styles.alertThreshold}>
                    Threshold: {alert.threshold}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
      
      <TouchableOpacity
        style={styles.configureAlertsButton}
        onPress={() => {
          // TODO: Open alert configuration modal
          Alert.alert('Configure Alerts', 'Alert configuration coming soon');
        }}
      >
        <Ionicons name="settings-outline" size={20} color="#6C63FF" />
        <Text style={styles.configureAlertsText}>Configure Alerts</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFunnelChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Onboarding Funnel</Text>
      
      <BarChart
        data={{
          labels: data?.funnel.map(s => s.step.substring(0, 3)) || [],
          datasets: [{
            data: data?.funnel.map(s => s.users) || [],
          }],
        }}
        width={width - 40}
        height={220}
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
        }}
        style={styles.chart}
        showValuesOnTopOfBars
      />
      
      <View style={styles.funnelStats}>
        <View style={styles.funnelStat}>
          <Text style={styles.funnelStatLabel}>Total Drop-off</Text>
          <Text style={styles.funnelStatValue}>
            {data ? (
              ((data.funnel[0].users - data.funnel[data.funnel.length - 1].users) / 
              data.funnel[0].users * 100).toFixed(1)
            ) : 0}%
          </Text>
        </View>
        <View style={styles.funnelStat}>
          <Text style={styles.funnelStatLabel}>Completion Rate</Text>
          <Text style={styles.funnelStatValue}>
            {data ? (
              (data.funnel[data.funnel.length - 1].users / 
              data.funnel[0].users * 100).toFixed(1)
            ) : 0}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderABTests = () => (
    <View style={styles.abTestsContainer}>
      <Text style={styles.sectionTitle}>A/B Test Results</Text>
      
      {data?.abTests.map(test => (
        <View key={test.testId} style={styles.abTestCard}>
          <Text style={styles.abTestName}>{test.testId.replace(/_/g, ' ').toUpperCase()}</Text>
          
          <View style={styles.abTestVariants}>
            <View style={styles.abTestVariant}>
              <Text style={styles.variantName}>Control</Text>
              <Text style={styles.variantConversions}>
                {test.variants.control?.conversions || 0} conversions
              </Text>
              <Text style={styles.variantRate}>
                {test.variants.control?.rate?.toFixed(1) || 0}% rate
              </Text>
            </View>
            
            {Object.entries(test.variants.variants || {}).map(([name, data]: [string, any]) => (
              <View key={name} style={styles.abTestVariant}>
                <Text style={styles.variantName}>{name}</Text>
                <Text style={styles.variantConversions}>
                  {data.conversions} conversions
                </Text>
                <Text style={styles.variantRate}>
                  {data.rate.toFixed(1)}% rate
                </Text>
                {data.rate > test.variants.control?.rate && (
                  <Text style={styles.variantWinner}>
                    +{(data.rate - test.variants.control.rate).toFixed(1)}% 🎉
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('start')}
          >
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              {dateRange.start.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.dateSeparator}>to</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker('end')}
          >
            <Text style={styles.dateText}>
              {dateRange.end.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => exportData('csv')}
          >
            <Ionicons name="download-outline" size={20} color="#6C63FF" />
            <Text style={styles.actionText}>Export CSV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => exportData('json')}
          >
            <Ionicons name="code-outline" size={20} color="#6C63FF" />
            <Text style={styles.actionText}>Export JSON</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareReport}
          >
            <Ionicons name="share-outline" size={20} color="#6C63FF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderAlerts()}
      {renderFunnelChart()}
      {renderABTests()}

      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? dateRange.start : dateRange.end}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(null);
            if (date) {
              setDateRange(prev => ({
                ...prev,
                [showDatePicker]: date,
              }));
            }
          }}
        />
      )}
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
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  dateSeparator: {
    marginHorizontal: 10,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  alertsContainer: {
    padding: 20,
  },
  noAlerts: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#4ECDC4',
    marginTop: 10,
  },
  alertCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginRight: 10,
    width: 250,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  alertCardError: {
    borderLeftColor: '#FF6B6B',
  },
  alertCardWarning: {
    borderLeftColor: '#FFD93D',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  alertMetrics: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  alertValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  alertThreshold: {
    fontSize: 12,
    color: '#999',
  },
  configureAlertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
    paddingVertical: 10,
  },
  configureAlertsText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '500',
  },
  chartContainer: {
    padding: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  funnelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
  },
  funnelStat: {
    alignItems: 'center',
  },
  funnelStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  funnelStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  abTestsContainer: {
    padding: 20,
  },
  abTestCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  abTestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  abTestVariants: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  abTestVariant: {
    alignItems: 'center',
    flex: 1,
  },
  variantName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  variantConversions: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  variantRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginTop: 2,
  },
  variantWinner: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default EnhancedAnalyticsDashboard;