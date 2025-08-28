
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

// Progress Ring Component for Readiness Score
const ProgressRing: React.FC<{ progress: number; size: number; strokeWidth: number }> = ({ 
  progress, 
  size, 
  strokeWidth 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.ringContainer}>
      <svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#60A5FA"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View style={styles.ringContent}>
        <Text style={styles.ringPercentage}>{Math.round(progress)}%</Text>
        <Text style={styles.ringLabel}>Readiness</Text>
      </View>
    </View>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: string; 
  onPress: () => void;
  gradient: string[];
}> = ({ title, subtitle, icon, onPress, gradient }) => (
  <TouchableOpacity
    style={[styles.quickActionCard, { backgroundColor: gradient[0] }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.quickActionContent}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Streak Indicator Component
const StreakIndicator: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.streakContainer}>
    <View style={styles.streakContent}>
      <Text style={styles.streakIcon}>🔥</Text>
      <View style={styles.streakText}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
    </View>
  </View>
);

// Metric Card Component (Updated)
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

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  isLoading?: boolean;
  onPress?: () => void;
}

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

const SocialFeedCard: React.FC = () => {
  const navigation = useNavigation();
  
  const handleNavigateToFeed = () => {
    // @ts-ignore - navigation types would be defined in navigation setup
    navigation.navigate('SocialFeed');
  };

  // Mock feed posts data
  const mockPosts = [
    { id: 1, user: 'Alex M.', action: 'completed a workout', time: '2h ago', type: 'workout' },
    { id: 2, user: 'Sarah K.', action: 'reached recovery goal', time: '4h ago', type: 'recovery' },
    { id: 3, user: 'Mike R.', action: 'shared progress', time: '6h ago', type: 'progress' }
  ];

  return (
    <TouchableOpacity
      style={[
        styles.socialFeedCard,
        isLandscape && !isTablet ? styles.socialFeedCardLandscape : styles.socialFeedCardPortrait
      ]}
      onPress={handleNavigateToFeed}
      activeOpacity={0.8}
    >
      <View style={styles.socialFeedHeader}>
        <Text style={styles.socialFeedTitle}>Social Feed</Text>
        <View style={styles.feedIcon}>
          <Text style={styles.feedIconText}>🔥</Text>
        </View>
      </View>
      
      <ScrollView style={styles.feedList} showsVerticalScrollIndicator={false}>
        {mockPosts.map((post) => (
          <View key={post.id} style={styles.feedItem}>
            <View style={styles.feedItemContent}>
              <Text style={styles.feedUserName}>{post.user}</Text>
              <Text style={styles.feedAction}>{post.action}</Text>
            </View>
            <Text style={styles.feedTime}>{post.time}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.feedFooter}>
        <Text style={styles.feedFooterText}>Tap to view all activity</Text>
      </View>
    </TouchableOpacity>
  );
};

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

  // Mock streak data - replace with real data
  const currentStreak = 7;

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

        {/* Hero Readiness Score Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Today's Readiness</Text>
              <Text style={styles.heroSubtitle}>
                {myRecovery?.recovery ? 
                  `You're ${myRecovery.recovery >= 70 ? 'ready' : myRecovery.recovery >= 40 ? 'moderate' : 'needing recovery'} today` : 
                  'Connect your wearable to see readiness'
                }
              </Text>
            </View>
            <View style={styles.heroRight}>
              <ProgressRing 
                progress={myRecovery?.recovery || 0} 
                size={120} 
                strokeWidth={8} 
              />
            </View>
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Start Workout"
              subtitle="Begin training"
              icon="💪"
              onPress={() => handleNavigate('Workout')}
              gradient={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
            />
            <QuickActionCard
              title="Log Meal"
              subtitle="Track nutrition"
              icon="🍽️"
              onPress={() => handleNavigate('Nutrition')}
              gradient={['rgba(16, 185, 129, 0.2)', 'rgba(59, 130, 246, 0.2)']}
            />
            <QuickActionCard
              title="Ask ARIA"
              subtitle="Get insights"
              icon="🤖"
              onPress={() => handleNavigate('Analytics')}
              gradient={['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            />
          </View>
        </View>

        {/* Daily Streak Indicator */}
        <View style={styles.streakSection}>
          <StreakIndicator streak={currentStreak} />
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
            <Text style={styles.sectionTitle}>Today's Metrics</Text>
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

          {/* Cards Row Section */}
          <View style={[
            styles.cardsRowSection,
            isLandscape && !isTablet ? styles.cardsRowSectionLandscape : styles.cardsRowSectionPortrait
          ]}>
            {/* Today's Schedule Section */}
            <View style={[
              styles.scheduleSection,
              isLandscape && !isTablet ? styles.scheduleSectionLandscape : styles.scheduleSectionPortrait
            ]}>
              <TodaysScheduleCard sessions={myCalendar?.todaySessions || []} />
            </View>

            {/* Social Feed Section */}
            <View style={[
              styles.socialFeedSection,
              isLandscape && !isTablet ? styles.socialFeedSectionLandscape : styles.socialFeedSectionPortrait
            ]}>
              <SocialFeedCard />
            </View>
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
  // Hero Card Styles
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    marginRight: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  heroRight: {
    alignItems: 'center',
  },
  // Progress Ring Styles
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  ringLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Quick Actions Styles
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  // Streak Styles
  streakSection: {
    marginBottom: 24,
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  streakText: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
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
  cardsRowSection: {
    gap: 12,
  },
  cardsRowSectionPortrait: {
    flexDirection: 'column',
  },
  cardsRowSectionLandscape: {
    flexDirection: 'row',
  },
  scheduleSection: {},
  scheduleSectionPortrait: {
    flex: 1,
  },
  scheduleSectionLandscape: {
    flex: 1,
    maxWidth: isTablet ? width * 0.35 : width * 0.3,
  },
  socialFeedSection: {},
  socialFeedSectionPortrait: {
    flex: 1,
  },
  socialFeedSectionLandscape: {
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
  socialFeedCard: {
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
  socialFeedCardPortrait: {
    width: '100%',
  },
  socialFeedCardLandscape: {
    width: '100%',
    height: 280,
  },
  socialFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  socialFeedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  feedIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedIconText: {
    fontSize: 16,
  },
  feedList: {
    flex: 1,
    maxHeight: 150,
  },
  feedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  feedItemContent: {
    flex: 1,
    marginRight: 8,
  },
  feedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  feedAction: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  feedTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  feedFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  feedFooterText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
});

export default Dashboard;
