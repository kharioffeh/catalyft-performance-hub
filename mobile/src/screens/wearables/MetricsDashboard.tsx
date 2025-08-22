import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { WearableManager } from '../../services/wearables/WearableManager';
import {
  UnifiedMetrics,
  WearableDevice,
  TrainingRecommendation,
  RecoveryMetrics,
} from '../../types/wearables';

const { width: screenWidth } = Dimensions.get('window');

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<UnifiedMetrics | null>(null);
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [recovery, setRecovery] = useState<RecoveryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'recovery' | 'activity' | 'sleep' | 'training'>('recovery');
  const [heartRate, setHeartRate] = useState<number | null>(null);
  
  const wearableManager = WearableManager.getInstance();
  
  useEffect(() => {
    loadData();
    subscribeToRealTimeData();
    
    // Update heart rate every 5 seconds
    const hrInterval = setInterval(updateHeartRate, 5000);
    
    return () => {
      clearInterval(hrInterval);
      unsubscribeFromRealTimeData();
    };
  }, []);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [unifiedMetrics, connectedDevices, recoveryMetrics] = await Promise.all([
        wearableManager.getUnifiedMetrics(),
        Promise.resolve(wearableManager.getDevices()),
        wearableManager.getCombinedRecoveryScore(),
      ]);
      
      setMetrics(unifiedMetrics);
      setDevices(connectedDevices);
      setRecovery(recoveryMetrics);
    } catch (error) {
      console.error('Failed to load wearable data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Sync all devices
      await wearableManager.syncAllDevices();
      await loadData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);
  
  const updateHeartRate = async () => {
    const hr = await wearableManager.getRealTimeHeartRate();
    setHeartRate(hr);
  };
  
  const subscribeToRealTimeData = () => {
    wearableManager.subscribeToRealTimeData((data) => {
      if (data.heartRate?.current) {
        setHeartRate(data.heartRate.current);
      }
      
      // Update metrics with real-time data
      setMetrics(prev => prev ? { ...prev, ...data } : null);
    });
  };
  
  const unsubscribeFromRealTimeData = () => {
    wearableManager.unsubscribeFromRealTimeData(() => {});
  };
  
  const renderRecoverySection = () => {
    if (!metrics || !recovery) return null;
    
    const recoveryScore = metrics.recoveryScore || recovery.score || 0;
    const readinessScore = metrics.readinessScore || 0;
    const strainScore = metrics.strainScore || 0;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery & Readiness</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Recovery"
            value={`${Math.round(recoveryScore)}%`}
            subtitle={recovery?.recommendation || 'Calculating...'}
            color={getRecoveryColor(recoveryScore)}
            icon="fitness"
          />
          
          <MetricCard
            title="Readiness"
            value={`${Math.round(readinessScore)}%`}
            subtitle="Training readiness"
            color={getRecoveryColor(readinessScore)}
            icon="trending-up"
          />
          
          <MetricCard
            title="Strain"
            value={strainScore.toFixed(1)}
            subtitle="Today's strain"
            color={getStrainColor(strainScore)}
            icon="barbell"
          />
          
          <MetricCard
            title="HRV"
            value={`${metrics.heartRateVariability?.value || 0}ms`}
            subtitle={metrics.heartRateVariability?.trend || 'stable'}
            color={getHRVColor(metrics.heartRateVariability?.trend)}
            icon="pulse"
          />
        </View>
        
        {recovery?.factors && (
          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>Recovery Factors</Text>
            {recovery.factors.map((factor, index) => (
              <View key={index} style={styles.factor}>
                <Icon
                  name={getFactorIcon(factor.impact)}
                  size={20}
                  color={getFactorColor(factor.impact)}
                />
                <Text style={styles.factorText}>{factor.description}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  const renderActivitySection = () => {
    if (!metrics) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Steps"
            value={metrics.steps.toLocaleString()}
            subtitle="Today"
            color="#4CAF50"
            icon="walk"
          />
          
          <MetricCard
            title="Calories"
            value={`${Math.round(metrics.calories.total)}`}
            subtitle={`Active: ${Math.round(metrics.calories.active)}`}
            color="#FF9800"
            icon="flame"
          />
          
          <MetricCard
            title="Distance"
            value={`${(metrics.distance / 1000).toFixed(1)} km`}
            subtitle="Total distance"
            color="#2196F3"
            icon="navigate"
          />
          
          <MetricCard
            title="Active Min"
            value={`${metrics.activeMinutes}`}
            subtitle="Active minutes"
            color="#9C27B0"
            icon="timer"
          />
        </View>
        
        {heartRate && (
          <View style={styles.heartRateContainer}>
            <Icon name="heart" size={24} color="#F44336" />
            <Text style={styles.heartRateText}>{heartRate} bpm</Text>
            <Text style={styles.heartRateLabel}>Live Heart Rate</Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderSleepSection = () => {
    if (!metrics?.sleep) return null;
    
    const sleep = metrics.sleep;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Duration"
            value={`${sleep.duration.toFixed(1)}h`}
            subtitle="Total sleep"
            color="#673AB7"
            icon="moon"
          />
          
          <MetricCard
            title="Efficiency"
            value={`${Math.round(sleep.efficiency)}%`}
            subtitle="Sleep efficiency"
            color={getSleepColor(sleep.efficiency)}
            icon="analytics"
          />
          
          <MetricCard
            title="Score"
            value={`${sleep.score || 0}`}
            subtitle="Sleep score"
            color={getSleepColor(sleep.score || 0)}
            icon="star"
          />
          
          <MetricCard
            title="Disturbances"
            value={`${sleep.disturbances || 0}`}
            subtitle="Wake ups"
            color="#FF5722"
            icon="alert-circle"
          />
        </View>
        
        {sleep.stages && (
          <View style={styles.sleepStagesContainer}>
            <Text style={styles.sleepStagesTitle}>Sleep Stages</Text>
            <SleepStageBar
              stage="Deep"
              minutes={sleep.stages.deep}
              color="#4A148C"
            />
            <SleepStageBar
              stage="REM"
              minutes={sleep.stages.rem}
              color="#7B1FA2"
            />
            <SleepStageBar
              stage="Light"
              minutes={sleep.stages.light}
              color="#AB47BC"
            />
            <SleepStageBar
              stage="Awake"
              minutes={sleep.stages.awake}
              color="#CE93D8"
            />
          </View>
        )}
      </View>
    );
  };
  
  const renderTrainingSection = () => {
    if (!metrics?.trainingLoad) return null;
    
    const load = metrics.trainingLoad;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Load</Text>
        
        <View style={styles.trainingLoadContainer}>
          <View style={styles.loadMetric}>
            <Text style={styles.loadLabel}>Acute Load (7d)</Text>
            <Text style={styles.loadValue}>{load.acute.toFixed(1)}</Text>
          </View>
          
          <View style={styles.loadMetric}>
            <Text style={styles.loadLabel}>Chronic Load (28d)</Text>
            <Text style={styles.loadValue}>{load.chronic.toFixed(1)}</Text>
          </View>
          
          <View style={styles.loadMetric}>
            <Text style={styles.loadLabel}>Load Ratio</Text>
            <Text style={[styles.loadValue, { color: getLoadRatioColor(load.ratio) }]}>
              {load.ratio.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(load.status) }]}>
          <Text style={styles.statusText}>{load.status.toUpperCase()}</Text>
        </View>
        
        <Text style={styles.recommendationText}>{load.recommendation}</Text>
      </View>
    );
  };
  
  const renderRecommendations = () => {
    if (!metrics?.recommendations || metrics.recommendations.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        
        {metrics.recommendations.map((rec, index) => (
          <TouchableOpacity key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Icon
                name={getRecommendationIcon(rec.type)}
                size={24}
                color={getPriorityColor(rec.priority)}
              />
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
            </View>
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            {rec.action && (
              <Text style={styles.recommendationAction}>{rec.action}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderDeviceStatus = () => {
    return (
      <View style={styles.devicesContainer}>
        <Text style={styles.devicesTitle}>Connected Devices</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <Icon
                name={getDeviceIcon(device.type)}
                size={24}
                color={device.connected ? '#4CAF50' : '#9E9E9E'}
              />
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceStatus}>
                {device.connected ? 'Connected' : 'Disconnected'}
              </Text>
              {device.lastSync && (
                <Text style={styles.deviceSync}>
                  Synced {format(new Date(device.lastSync), 'HH:mm')}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading metrics...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metrics Dashboard</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#6200EE" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        {(['recovery', 'activity', 'sleep', 'training'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedMetric === tab && styles.activeTab]}
            onPress={() => setSelectedMetric(tab)}
          >
            <Text style={[styles.tabText, selectedMetric === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {renderDeviceStatus()}
        
        {selectedMetric === 'recovery' && renderRecoverySection()}
        {selectedMetric === 'activity' && renderActivitySection()}
        {selectedMetric === 'sleep' && renderSleepSection()}
        {selectedMetric === 'training' && renderTrainingSection()}
        
        {renderRecommendations()}
      </ScrollView>
    </SafeAreaView>
  );
};

// Component for metric cards
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
}> = ({ title, value, subtitle, color, icon }) => (
  <View style={styles.metricCard}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.metricTitle}>{title}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricSubtitle}>{subtitle}</Text>
  </View>
);

// Component for sleep stage bars
const SleepStageBar: React.FC<{
  stage: string;
  minutes: number;
  color: string;
}> = ({ stage, minutes, color }) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  return (
    <View style={styles.sleepStageBar}>
      <Text style={styles.sleepStageName}>{stage}</Text>
      <View style={styles.sleepStageProgress}>
        <View
          style={[
            styles.sleepStageProgressBar,
            {
              backgroundColor: color,
              width: `${Math.min((minutes / 480) * 100, 100)}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.sleepStageTime}>
        {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
      </Text>
    </View>
  );
};

// Helper functions
const getRecoveryColor = (score: number): string => {
  if (score >= 67) return '#4CAF50';
  if (score >= 34) return '#FFC107';
  return '#F44336';
};

const getStrainColor = (strain: number): string => {
  if (strain < 10) return '#4CAF50';
  if (strain < 15) return '#FFC107';
  return '#F44336';
};

const getHRVColor = (trend?: string): string => {
  if (trend === 'improving') return '#4CAF50';
  if (trend === 'declining') return '#F44336';
  return '#FFC107';
};

const getSleepColor = (value: number): string => {
  if (value >= 85) return '#4CAF50';
  if (value >= 70) return '#FFC107';
  return '#F44336';
};

const getLoadRatioColor = (ratio: number): string => {
  if (ratio > 1.5) return '#F44336';
  if (ratio > 1.2) return '#FF9800';
  if (ratio > 0.8) return '#4CAF50';
  return '#FFC107';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    productive: '#4CAF50',
    maintaining: '#2196F3',
    recovery: '#FFC107',
    overreaching: '#FF9800',
    detraining: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

const getFactorIcon = (impact: string): string => {
  if (impact === 'positive') return 'checkmark-circle';
  if (impact === 'negative') return 'close-circle';
  return 'remove-circle';
};

const getFactorColor = (impact: string): string => {
  if (impact === 'positive') return '#4CAF50';
  if (impact === 'negative') return '#F44336';
  return '#FFC107';
};

const getPriorityColor = (priority: string): string => {
  if (priority === 'high') return '#F44336';
  if (priority === 'medium') return '#FF9800';
  return '#4CAF50';
};

const getRecommendationIcon = (type: string): string => {
  const icons: Record<string, string> = {
    intensity: 'barbell',
    duration: 'timer',
    recovery: 'bed',
    nutrition: 'nutrition',
    sleep: 'moon',
  };
  return icons[type] || 'information-circle';
};

const getDeviceIcon = (type: string): string => {
  const icons: Record<string, string> = {
    apple_watch: 'watch',
    whoop: 'fitness',
    garmin: 'navigate',
    fitbit: 'pulse',
    google_fit: 'logo-google',
  };
  return icons[type] || 'watch';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200EE',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  metricCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  metricSubtitle: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
  },
  heartRateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginHorizontal: 8,
  },
  heartRateLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  factorsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 12,
    flex: 1,
  },
  sleepStagesContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sleepStagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  sleepStageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  sleepStageName: {
    width: 60,
    fontSize: 12,
    color: '#666',
  },
  sleepStageProgress: {
    flex: 1,
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sleepStageProgressBar: {
    height: '100%',
    borderRadius: 10,
  },
  sleepStageTime: {
    width: 60,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  trainingLoadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadMetric: {
    alignItems: 'center',
  },
  loadLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  loadValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  recommendationCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 12,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recommendationAction: {
    fontSize: 12,
    color: '#6200EE',
    fontWeight: '600',
  },
  devicesContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
  },
  devicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  deviceCard: {
    alignItems: 'center',
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    minWidth: 100,
  },
  deviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
  },
  deviceStatus: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  deviceSync: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});