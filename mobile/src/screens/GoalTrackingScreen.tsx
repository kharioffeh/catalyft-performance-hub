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
import { Svg, Circle, Rect, Line, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface GoalData {
  fitnessGoals: {
    id: string;
    title: string;
    description: string;
    category: 'strength' | 'endurance' | 'flexibility' | 'weight' | 'nutrition';
    target: number;
    current: number;
    unit: string;
    deadline: string;
    status: 'on_track' | 'ahead' | 'behind' | 'completed';
    milestones: {
      id: string;
      title: string;
      target: number;
      achieved: boolean;
      date?: string;
    }[];
  }[];
  goalProgress: {
    week: string;
    overall: number;
    strength: number;
    endurance: number;
    flexibility: number;
    weight: number;
    nutrition: number;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
    type: 'milestone' | 'streak' | 'personal_record' | 'challenge';
    color: string;
  }[];
  upcomingMilestones: {
    id: string;
    goalTitle: string;
    milestoneTitle: string;
    target: number;
    current: number;
    unit: string;
    daysLeft: number;
  }[];
}

const GoalTrackingScreen: React.FC = () => {
  const [data, setData] = useState<GoalData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchGoalData();
    startPulseAnimation();
  }, [selectedCategory]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchGoalData = async () => {
    setRefreshing(true);
    
    // Mock data for premium goal tracking analytics
    setTimeout(() => {
      setData({
        fitnessGoals: [
          {
            id: '1',
            title: 'Bench Press 225 lbs',
            description: 'Achieve a 225 lb bench press for 1 rep',
            category: 'strength',
            target: 225,
            current: 200,
            unit: 'lbs',
            deadline: '2024-03-15',
            status: 'on_track',
            milestones: [
              { id: '1-1', title: '200 lbs', target: 200, achieved: true, date: '2024-01-10' },
              { id: '1-2', title: '210 lbs', target: 210, achieved: false },
              { id: '1-3', title: '225 lbs', target: 225, achieved: false },
            ],
          },
          {
            id: '2',
            title: 'Run 5K in 25 minutes',
            description: 'Complete a 5K run in under 25 minutes',
            category: 'endurance',
            target: 25,
            current: 28,
            unit: 'min',
            deadline: '2024-04-01',
            status: 'behind',
            milestones: [
              { id: '2-1', title: '30 min', target: 30, achieved: true, date: '2024-01-05' },
              { id: '2-2', title: '28 min', target: 28, achieved: true, date: '2024-01-20' },
              { id: '2-3', title: '25 min', target: 25, achieved: false },
            ],
          },
          {
            id: '3',
            title: 'Lose 20 lbs',
            description: 'Reduce body weight from 200 to 180 lbs',
            category: 'weight',
            target: 180,
            current: 190,
            unit: 'lbs',
            deadline: '2024-05-01',
            status: 'ahead',
            milestones: [
              { id: '3-1', title: '195 lbs', target: 195, achieved: true, date: '2024-01-15' },
              { id: '3-2', title: '190 lbs', target: 190, achieved: true, date: '2024-01-25' },
              { id: '3-3', title: '185 lbs', target: 185, achieved: false },
              { id: '3-4', title: '180 lbs', target: 180, achieved: false },
            ],
          },
          {
            id: '4',
            title: 'Touch Toes',
            description: 'Achieve full forward fold flexibility',
            category: 'flexibility',
            target: 100,
            current: 75,
            unit: '%',
            deadline: '2024-06-01',
            status: 'on_track',
            milestones: [
              { id: '4-1', title: '50%', target: 50, achieved: true, date: '2024-01-01' },
              { id: '4-2', title: '75%', target: 75, achieved: true, date: '2024-01-20' },
              { id: '4-3', title: '100%', target: 100, achieved: false },
            ],
          },
        ],
        goalProgress: [
          { week: 'W1', overall: 65, strength: 70, endurance: 60, flexibility: 55, weight: 75, nutrition: 70 },
          { week: 'W2', overall: 68, strength: 72, endurance: 65, flexibility: 60, weight: 78, nutrition: 72 },
          { week: 'W3', overall: 72, strength: 75, endurance: 68, flexibility: 65, weight: 80, nutrition: 75 },
          { week: 'W4', overall: 75, strength: 78, endurance: 70, flexibility: 68, weight: 82, nutrition: 78 },
          { week: 'W5', overall: 78, strength: 80, endurance: 72, flexibility: 70, weight: 85, nutrition: 80 },
          { week: 'W6', overall: 82, strength: 83, endurance: 75, flexibility: 73, weight: 87, nutrition: 83 },
        ],
        achievements: [
          {
            id: '1',
            title: 'First 200 lb Bench',
            description: 'Achieved 200 lb bench press milestone',
            icon: 'fitness',
            date: '2024-01-10',
            type: 'milestone',
            color: '#EF4444',
          },
          {
            id: '2',
            title: '30-Day Streak',
            description: 'Completed workouts for 30 consecutive days',
            icon: 'flame',
            date: '2024-01-15',
            type: 'streak',
            color: '#F59E0B',
          },
          {
            id: '3',
            title: '5K PR',
            description: 'Set new personal record in 5K run',
            icon: 'trophy',
            date: '2024-01-20',
            type: 'personal_record',
            color: '#22C55E',
          },
        ],
        upcomingMilestones: [
          {
            id: '1',
            goalTitle: 'Bench Press 225 lbs',
            milestoneTitle: '210 lbs',
            target: 210,
            current: 200,
            unit: 'lbs',
            daysLeft: 5,
          },
          {
            id: '2',
            goalTitle: 'Run 5K in 25 minutes',
            milestoneTitle: '25 min',
            target: 25,
            current: 28,
            unit: 'min',
            daysLeft: 12,
          },
        ],
      });
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'ahead':
        return '#3B82F6';
      case 'on_track':
        return '#F59E0B';
      case 'behind':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'ahead':
        return 'Ahead';
      case 'on_track':
        return 'On Track';
      case 'behind':
        return 'Behind';
      default:
        return 'Unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return 'fitness';
      case 'endurance':
        return 'flash';
      case 'flexibility':
        return 'body';
      case 'weight':
        return 'scale';
      case 'nutrition':
        return 'restaurant';
      default:
        return 'target';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return '#EF4444';
      case 'endurance':
        return '#22C55E';
      case 'flexibility':
        return '#3B82F6';
      case 'weight':
        return '#F59E0B';
      case 'nutrition':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const renderGoalCard = (goal: any) => {
    const progress = (goal.current / goal.target) * 100;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(goal.category) }]}>
              <Ionicons name={getCategoryIcon(goal.category) as any} size={16} color="white" />
            </View>
            <View style={styles.goalText}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) }]}>
            <Text style={styles.statusText}>{getStatusText(goal.status)}</Text>
          </View>
        </View>
        
        <View style={styles.goalProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {goal.current} / {goal.target} {goal.unit}
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: getStatusColor(goal.status),
                },
              ]}
            />
          </View>
        </View>
        
        <View style={styles.goalFooter}>
          <Text style={styles.deadlineText}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
          </Text>
          <View style={styles.milestoneCount}>
            <Ionicons name="flag" size={16} color="#666" />
            <Text style={styles.milestoneText}>
              {goal.milestones.filter((m: any) => m.achieved).length}/{goal.milestones.length} milestones
            </Text>
          </View>
        </View>
        
        {/* Milestones */}
        <View style={styles.milestonesContainer}>
          {goal.milestones.map((milestone: any) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneInfo}>
                <Ionicons
                  name={milestone.achieved ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={milestone.achieved ? '#22C55E' : '#D1D5DB'}
                />
                <Text style={[
                  styles.milestoneTitle,
                  milestone.achieved && styles.milestoneAchieved
                ]}>
                  {milestone.title}
                </Text>
              </View>
              {milestone.achieved && milestone.date && (
                <Text style={styles.milestoneDate}>{milestone.date}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderGoalProgressChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Goal Progress Over Time</Text>
      <View style={styles.progressChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={40 + i * 30}
              x2={width - 80}
              y2={40 + i * 30}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
          {/* Overall progress line */}
          <Path
            d={data?.goalProgress.map((week, i) => {
              const x = 30 + i * 50;
              const y = 40 + (100 - week.overall) * 1.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#6C63FF"
            strokeWidth={3}
            fill="transparent"
          />
          
          {/* Category lines */}
          <Path
            d={data?.goalProgress.map((week, i) => {
              const x = 30 + i * 50;
              const y = 40 + (100 - week.strength) * 1.6;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') || ''}
            stroke="#EF4444"
            strokeWidth={2}
            fill="transparent"
            strokeDasharray="5,5"
          />
          
          {/* Week labels */}
          {data?.goalProgress.map((week, index) => (
            <Text
              key={index}
              x={30 + index * 50}
              y={190}
              fontSize={10}
              textAnchor="middle"
              fill="#666"
            >
              {week.week}
            </Text>
          ))}
        </Svg>
        
        <View style={styles.progressLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6C63FF' }]} />
            <Text style={styles.legendText}>Overall</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Strength</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Recent Achievements</Text>
      <View style={styles.achievementsGrid}>
        {data?.achievements.map((achievement) => (
          <LinearGradient
            key={achievement.id}
            colors={[achievement.color, `${achievement.color}DD`]}
            style={styles.achievementCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.achievementIcon}>
              <Ionicons name={achievement.icon as any} size={32} color="white" />
            </View>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );

  const renderUpcomingMilestones = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Upcoming Milestones</Text>
      <View style={styles.milestonesList}>
        {data?.upcomingMilestones.map((milestone) => (
          <Animated.View
            key={milestone.id}
            style={[
              styles.upcomingMilestone,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneGoalTitle}>{milestone.goalTitle}</Text>
              <View style={styles.daysLeftBadge}>
                <Text style={styles.daysLeftText}>{milestone.daysLeft} days</Text>
              </View>
            </View>
            <Text style={styles.milestoneMilestoneTitle}>{milestone.milestoneTitle}</Text>
            <View style={styles.milestoneProgress}>
              <View style={styles.milestoneProgressBar}>
                <View
                  style={[
                    styles.milestoneProgressFill,
                    {
                      width: `${(milestone.current / milestone.target) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.milestoneProgressText}>
                {milestone.current} / {milestone.target} {milestone.unit}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchGoalData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Goal Tracking</Text>
        <Text style={styles.subtitle}>Track your fitness milestones</Text>
        
        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          {['all', 'strength', 'endurance', 'flexibility', 'weight', 'nutrition'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === category && styles.filterTextActive,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Goals */}
      <View style={styles.goalsContainer}>
        {data?.fitnessGoals
          .filter(goal => selectedCategory === 'all' || goal.category === selectedCategory)
          .map(renderGoalCard)}
      </View>

      {renderGoalProgressChart()}
      {renderAchievements()}
      {renderUpcomingMilestones()}
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
  categoryFilter: {
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
  goalsContainer: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  goalInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryBadge: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  goalProgress: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deadlineText: {
    fontSize: 14,
    color: '#666',
  },
  milestoneCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  milestoneText: {
    fontSize: 14,
    color: '#666',
  },
  milestonesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  milestoneTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  milestoneAchieved: {
    textDecorationLine: 'line-through',
    color: '#22C55E',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#666',
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
  progressChart: {
    alignItems: 'center',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  achievementIcon: {
    marginBottom: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementDate: {
    fontSize: 10,
    color: 'white',
    opacity: 0.7,
  },
  milestonesList: {
    gap: 15,
  },
  upcomingMilestone: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#6C63FF',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  daysLeftBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysLeftText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  milestoneMilestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 15,
  },
  milestoneProgress: {
    alignItems: 'center',
  },
  milestoneProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  milestoneProgressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default GoalTrackingScreen;