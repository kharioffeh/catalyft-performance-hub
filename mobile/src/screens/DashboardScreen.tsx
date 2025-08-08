import React from 'react';
import { View, Text, ScrollView, RefreshControl, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const healthMetrics = [
    { title: 'Strain', value: '15.8', id: 'strain' },
    { title: 'Recovery', value: '78%', id: 'recovery' },
    { title: 'Sleep', value: '7.2h', id: 'sleep' },
    { title: 'HRV', value: '42ms', id: 'hrv' },
  ];

  return (
    <ScrollView 
      style={styles.container}
      testID="dashboard-container"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          testID="dashboard-refresh-control"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText} testID="dashboard-welcome-text">
          Welcome back to CataLyft!
        </Text>
        <TouchableOpacity testID="user-profile-avatar">
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View testID="premium-status-badge" style={styles.premiumBadge}>
        <Text style={styles.premiumText}>Premium Active</Text>
      </View>

      <View style={styles.metricsContainer} testID="health-metrics-container">
        <Text style={styles.sectionTitle}>Today's Health Metrics</Text>
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => (
            <TouchableOpacity 
              key={metric.id}
              style={styles.metricCard}
              testID={`${metric.title.toLowerCase()}-metric-card`}
            >
              <Text style={styles.metricTitle}>{metric.title}</Text>
              <Text 
                style={styles.metricValue}
                testID={`${metric.id}-value`}
              >
                {metric.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.workoutSection}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
        <TouchableOpacity 
          style={styles.workoutCard}
          testID="recommended-workout-card"
        >
          <Text style={styles.workoutTitle}>Upper Body Push</Text>
          <Text style={styles.workoutDescription}>
            Bench Press, Overhead Press, Dips
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <Text testID="workouts-completed-today">Workouts: 0</Text>
          <Text testID="calories-burned-updated">Calories: 0</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  premiumBadge: {
    backgroundColor: '#10B981',
    padding: 8,
    margin: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  premiumText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsContainer: {
    padding: 20,
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
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  workoutSection: {
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  workoutDescription: {
    color: '#666',
  },
  statsSection: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
});