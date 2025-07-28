import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useMyRecovery } from '@/hooks/useMyRecovery';
import { useMyCalendar } from '@/hooks/useMyCalendar';
import { useMyInsights } from '@/hooks/useMyInsights';
import { useWearableStatus } from '@/hooks/useWearableStatus';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

interface KpiCardProps {
  title: string;
  value: string;
  color: string;
  isLoading?: boolean;
  onPress?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, color, isLoading, onPress }) => (
  <TouchableOpacity style={styles.kpiCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.kpiCardContent}>
      <Text style={styles.kpiTitle}>{title}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      )}
    </View>
  </TouchableOpacity>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color,
  backgroundColor,
  onPress,
  children,
}) => (
  <TouchableOpacity
    style={[styles.metricCard, { backgroundColor }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.metricCardHeader}>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={[styles.metricValue, { color: '#ffffff' }]}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    {children}
  </TouchableOpacity>
);

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const { data: wearableStatus } = useWearableStatus(profile?.id);
  const { data: myInsights } = useMyInsights();
  const { data: myRecovery, isLoading: recoveryLoading } = useMyRecovery();
  const { data: myCalendar } = useMyCalendar();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWearableConnect = async () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      Alert.alert('Success', 'Wearable connected successfully!');
    }, 2000);
  };

  const handleNavigate = (screen: string) => {
    // @ts-ignore - navigation types would be defined in navigation setup
    navigation.navigate(screen);
  };

  // Mobile KPI data
  const mobileKpiData = [
    {
      id: 'recovery',
      title: 'Recovery',
      value: myRecovery?.recovery ? `${Math.round(myRecovery.recovery)}%` : '—',
      color: '#10B981', // green-400
      isLoading: recoveryLoading,
      onPress: () => handleNavigate('Analytics'),
    },
    {
      id: 'sessions',
      title: 'My Sessions',
      value: myCalendar?.upcomingCount?.toString() || '—',
      color: '#60A5FA', // blue-400
      isLoading: false,
      onPress: () => handleNavigate('Calendar'),
    },
    {
      id: 'insights',
      title: 'AI Insights',
      value: myInsights?.count?.toString() || '—',
      color: '#A78BFA', // purple-400
      isLoading: false,
      onPress: () => handleNavigate('Chat'),
    },
    {
      id: 'feed',
      title: 'Community Feed',
      value: '—',
      color: '#FB923C', // orange-400
      isLoading: false,
      onPress: () => handleNavigate('Feed'),
    },
  ];

  if (!profile?.id) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {profile?.full_name || 'User'}
          </Text>
          <Text style={styles.subtitleText}>Your daily overview</Text>
        </View>

        {/* Wearable Connection Banner */}
        {!wearableStatus?.wearable_connected && (
          <TouchableOpacity
            style={styles.wearableBanner}
            onPress={handleWearableConnect}
            activeOpacity={0.8}
          >
            <View style={styles.wearableBannerContent}>
              <View style={styles.wearableIcon}>
                <Text style={styles.wearableIconText}>📱</Text>
              </View>
              <View style={styles.wearableTextContainer}>
                <Text style={styles.wearableBannerTitle}>Connect your wearable</Text>
                <Text style={styles.wearableBannerSubtitle}>
                  Link Whoop or Apple Health so ARIA can personalise your program.
                </Text>
              </View>
            </View>
            <View style={styles.connectButton}>
              {isConnecting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Device</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* KPI Grid for Mobile */}
        <View style={styles.kpiGrid}>
          {mobileKpiData.map((kpi) => (
            <KpiCard
              key={kpi.id}
              title={kpi.title}
              value={kpi.value}
              color={kpi.color}
              isLoading={kpi.isLoading}
              onPress={kpi.onPress}
            />
          ))}
        </View>

        {/* Metric Cards Grid */}
        <View style={styles.metricGrid}>
          {/* Recovery Card */}
          <MetricCard
            title="Recovery"
            value={myRecovery?.recovery ? `${Math.round(myRecovery.recovery)}%` : '—'}
            subtitle="Current recovery score"
            color="#10B981"
            backgroundColor="rgba(16, 185, 129, 0.1)"
            onPress={() => handleNavigate('Analytics')}
          >
            {myRecovery?.trend && (
              <Text style={[styles.trendText, { color: myRecovery.trend.positive ? '#10B981' : '#EF4444' }]}>
                {myRecovery.trend.positive ? '↗' : '↘'} {myRecovery.trend.value}
              </Text>
            )}
          </MetricCard>

          {/* My Sessions Card */}
          <MetricCard
            title="My Sessions"
            value={myCalendar?.upcomingCount || 0}
            subtitle="Today's sessions"
            color="#60A5FA"
            backgroundColor="rgba(96, 165, 250, 0.1)"
            onPress={() => handleNavigate('Calendar')}
          >
            {myCalendar?.completedToday && myCalendar.completedToday > 0 && (
              <Text style={styles.completedText}>
                {myCalendar.completedToday} completed
              </Text>
            )}
          </MetricCard>

          {/* AI Insights Card */}
          <MetricCard
            title="AI Insights"
            value={myInsights?.count || 0}
            subtitle="New insights today"
            color="#A78BFA"
            backgroundColor="rgba(167, 139, 250, 0.1)"
            onPress={() => handleNavigate('Chat')}
          />

          {/* Community Feed Card */}
          <MetricCard
            title="Community Feed"
            value="—"
            subtitle="Latest updates"
            color="#FB923C"
            backgroundColor="rgba(251, 146, 60, 0.1)"
            onPress={() => handleNavigate('Feed')}
          >
            <Text style={styles.feedText}>Connect with others</Text>
          </MetricCard>
        </View>

        {/* Insights Section */}
        {myInsights?.insights && (
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>ARIA Insights</Text>
            <Text style={styles.insightsContent}>
              {myInsights.insights.join(' ')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937', // brand-charcoal equivalent
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
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
  wearableBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wearableBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wearableIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wearableIconText: {
    fontSize: 24,
  },
  wearableTextContainer: {
    flex: 1,
  },
  wearableBannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  wearableBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
  },
  connectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  kpiCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2, // Two columns with gap
    minHeight: 80,
  },
  kpiCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  kpiTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    borderRadius: 12,
    padding: 20,
    width: isTablet ? (width - 44) / 2 : width - 32,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  feedText: {
    fontSize: 12,
    color: '#FB923C',
    marginTop: 4,
  },
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  insightsContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});

export default Dashboard;