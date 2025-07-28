
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRecovery } from '@/hooks/useMyRecovery';
import { useMyCalendar } from '@/hooks/useMyCalendar';
import { useMyInsights } from '@/hooks/useMyInsights';
import { useWearableStatus } from '@/hooks/useWearableStatus';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isLandscape = width > height;

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLoading?: boolean;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  isLoading,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.metricCard,
      isLandscape && !isTablet ? styles.metricCardLandscape : styles.metricCardPortrait
    ]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.metricCardContent}>
      <Text style={styles.metricTitle}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" style={styles.loader} />
      ) : (
        <Text style={styles.metricValue}>{value}</Text>
      )}
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: string;
}

const TodaysScheduleCard: React.FC<{ sessions: any[] }> = ({ sessions }) => (
  <View style={[
    styles.scheduleCard,
    isLandscape && !isTablet ? styles.scheduleCardLandscape : styles.scheduleCardPortrait
  ]}>
    <Text style={styles.scheduleTitle}>Today's Schedule</Text>
    {sessions && sessions.length > 0 ? (
      <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
        {sessions.map((session, index) => (
          <View key={index} style={styles.sessionItem}>
            <View style={styles.sessionDot} />
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionTitle}>
                {session.name || 'Workout Session'}
              </Text>
              <Text style={styles.sessionTime}>
                {new Date(session.scheduled_for).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    ) : (
      <View style={styles.noSessionsContainer}>
        <Text style={styles.noSessionsText}>No sessions scheduled</Text>
        <Text style={styles.noSessionsSubtext}>Enjoy your rest day!</Text>
      </View>
    )}
  </View>
);

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const { data: wearableStatus } = useWearableStatus(profile?.id);
  const { data: myInsights, isLoading: insightsLoading } = useMyInsights();
  const { data: myRecovery, isLoading: recoveryLoading } = useMyRecovery();
  const { data: myCalendar, isLoading: calendarLoading } = useMyCalendar();

  const handleNavigate = (screen: string) => {
    // @ts-ignore - navigation types would be defined in navigation setup
    navigation.navigate(screen);
  };

  const getStressValue = () => {
    // Mock stress calculation based on recovery
    if (!myRecovery?.recovery) return '—';
    const stress = Math.max(0, 100 - myRecovery.recovery);
    return `${Math.round(stress)}%`;
  };

  const getStrainValue = () => {
    // Mock strain calculation
    return myRecovery?.recovery ? `${Math.round(myRecovery.recovery * 0.8)}` : '—';
  };

  if (!profile?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {profile?.full_name || 'User'}
          </Text>
          <Text style={styles.subtitleText}>Your daily overview</Text>
        </View>

        {/* Main Content Layout */}
        <View style={[
          styles.mainLayout,
          isLandscape && !isTablet ? styles.mainLayoutLandscape : styles.mainLayoutPortrait
        ]}>
          {/* Metric Cards Section */}
          <View style={[
            styles.metricsSection,
            isLandscape && !isTablet ? styles.metricsSectionLandscape : styles.metricsSectionPortrait
          ]}>
            <View style={styles.metricsGrid}>
              {/* Recovery Card */}
              <MetricCard
                title="Recovery"
                value={myRecovery?.recovery ? `${Math.round(myRecovery.recovery)}%` : '—'}
                subtitle="Current recovery score"
                isLoading={recoveryLoading}
                onPress={() => handleNavigate('Analytics')}
              />

              {/* Strain Card */}
              <MetricCard
                title="Strain"
                value={getStrainValue()}
                subtitle="Today's strain level"
                onPress={() => handleNavigate('Analytics')}
              />

              {/* Stress Card */}
              <MetricCard
                title="Stress"
                value={getStressValue()}
                subtitle="Stress indicator"
                onPress={() => handleNavigate('Analytics')}
              />

              {/* Today's Sessions Card */}
              <MetricCard
                title="Today's Sessions"
                value={myCalendar?.upcomingCount || 0}
                subtitle={
                  myCalendar?.completedToday && myCalendar.completedToday > 0
                    ? `${myCalendar.completedToday} completed`
                    : "Sessions planned"
                }
                isLoading={calendarLoading}
                onPress={() => handleNavigate('Calendar')}
              />
            </View>
          </View>

          {/* Today's Schedule Section */}
          <View style={[
            styles.scheduleSection,
            isLandscape && !isTablet ? styles.scheduleSectionLandscape : styles.scheduleSectionPortrait
          ]}>
            <TodaysScheduleCard sessions={myCalendar?.todaySessions || []} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937', // brand-charcoal equivalent
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  mainLayout: {
    flex: 1,
  },
  mainLayoutPortrait: {
    flexDirection: 'column',
  },
  mainLayoutLandscape: {
    flexDirection: 'row',
    gap: 16,
  },
  metricsSection: {
    marginBottom: 24,
  },
  metricsSectionPortrait: {
    flex: 1,
  },
  metricsSectionLandscape: {
    flex: 2,
    marginBottom: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    // Glassmorphism styling
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    // Backdrop blur effect simulation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  metricCardPortrait: {
    width: (width - 44) / 2, // Two columns with gap
  },
  metricCardLandscape: {
    width: isTablet ? (width * 0.6 - 44) / 2 : (width * 0.65 - 44) / 2,
  },
  metricCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  metricSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loader: {
    marginVertical: 8,
  },
  scheduleSection: {},
  scheduleSectionPortrait: {
    flex: 1,
  },
  scheduleSectionLandscape: {
    flex: 1,
    maxWidth: isTablet ? width * 0.35 : width * 0.3,
  },
  scheduleCard: {
    // Glassmorphism styling
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    // Backdrop blur effect simulation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scheduleCardPortrait: {
    width: '100%',
  },
  scheduleCardLandscape: {
    width: '100%',
    height: 280,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  sessionsList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60A5FA',
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  noSessionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSessionsText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  noSessionsSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default Dashboard;
