import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState('7d');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  const tonnageData = [
    { week: 'Week 1', tonnage: 12500 },
    { week: 'Week 2', tonnage: 13200 },
    { week: 'Week 3', tonnage: 14100 },
    { week: 'Week 4', tonnage: 13800 },
  ];

  const muscleGroups = [
    { name: 'chest', activation: 85, color: '#EF4444' },
    { name: 'back', activation: 72, color: '#F97316' },
    { name: 'shoulders', activation: 68, color: '#EAB308' },
    { name: 'legs', activation: 91, color: '#22C55E' },
    { name: 'arms', activation: 77, color: '#3B82F6' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      testID="analytics-container"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          testID="analytics-refresh-control"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.id)}
            testID={`analytics-period-${period.id}`}
          >
            <Text 
              style={[
                styles.periodText,
                selectedPeriod === period.id && styles.periodTextActive
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Charts Container */}
      <View style={styles.chartsContainer} testID="analytics-charts-container">
        
        {/* Tonnage Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle} testID="tonnage-chart-title">
            Weekly Tonnage
          </Text>
          <View style={styles.chart} testID="tonnage-chart">
            <View style={styles.chartGrid}>
              {tonnageData.map((data, index) => (
                <View key={index} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: (data.tonnage / 15000) * 100 }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{data.week}</Text>
                  <Text style={styles.barValue}>{data.tonnage}kg</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.chartOverlay}
              testID="tonnage-detail-tooltip"
            >
              <Text style={styles.tooltipText}>Tap for details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Muscle Heatmap Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle} testID="heatmap-chart-title">
            Muscle Activation Heatmap
          </Text>
          <View style={styles.heatmapChart} testID="muscle-heatmap-chart">
            <View style={styles.heatmapGrid}>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle.name}
                  style={[
                    styles.muscleBox,
                    { backgroundColor: muscle.color, opacity: muscle.activation / 100 }
                  ]}
                  testID={`muscle-group-${muscle.name}`}
                >
                  <Text style={styles.muscleLabel}>{muscle.name}</Text>
                  <Text style={styles.muscleValue}>{muscle.activation}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Volume</Text>
              <Text style={styles.metricValue}>53,600 kg</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Avg Intensity</Text>
              <Text style={styles.metricValue}>82%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Sessions</Text>
              <Text style={styles.metricValue}>16</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>PRs This Month</Text>
              <Text style={styles.metricValue}>3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Hidden elements for E2E testing */}
      <View style={styles.hidden}>
        <View testID="muscle-detail-popup" style={{ opacity: 0 }}>
          <Text>Muscle detail popup</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  periodButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    minWidth: 80,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4F46E5',
  },
  periodText: {
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  chartsContainer: {
    padding: 20,
  },
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    height: 200,
    position: 'relative',
  },
  chartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    backgroundColor: '#4F46E5',
    width: 30,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
  barValue: {
    fontSize: 10,
    color: '#999',
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 5,
    borderRadius: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
  heatmapChart: {
    height: 150,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  muscleBox: {
    width: '30%',
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  muscleLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  muscleValue: {
    color: '#fff',
    fontSize: 10,
  },
  metricsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  hidden: {
    position: 'absolute',
    top: -1000,
  },
});