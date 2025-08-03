import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  workouts: number;
  category: string;
  progress: number;
  image: string;
}

interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  duration: number;
  calories: number;
  strain: number;
  type: string;
}

const TrainingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Strength' | 'Cardio' | 'HIIT' | 'Yoga'>('All');
  
  const [programs, setPrograms] = useState<WorkoutProgram[]>([
    {
      id: '1',
      name: '12-Week Strength Builder',
      description: 'Build muscle and strength with progressive overload',
      duration: '12 weeks',
      difficulty: 'Intermediate',
      workouts: 36,
      category: 'Strength',
      progress: 25,
      image: '💪'
    },
    {
      id: '2', 
      name: 'HIIT Fat Burner',
      description: 'High-intensity workouts for maximum calorie burn',
      duration: '8 weeks',
      difficulty: 'Advanced',
      workouts: 24,
      category: 'HIIT',
      progress: 0,
      image: '🔥'
    },
    {
      id: '3',
      name: 'Yoga Flow Flexibility',
      description: 'Improve flexibility and mindfulness',
      duration: '6 weeks',
      difficulty: 'Beginner',
      workouts: 18,
      category: 'Yoga',
      progress: 60,
      image: '🧘'
    },
    {
      id: '4',
      name: 'Marathon Training',
      description: 'Progressive running program for endurance',
      duration: '16 weeks',
      difficulty: 'Advanced',
      workouts: 48,
      category: 'Cardio',
      progress: 15,
      image: '🏃'
    }
  ]);

  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([
    {
      id: '1',
      name: 'Upper Body Strength',
      date: 'Today',
      duration: 45,
      calories: 312,
      strain: 8.2,
      type: 'Strength'
    },
    {
      id: '2',
      name: 'Morning Run',
      date: 'Yesterday',
      duration: 30,
      calories: 285,
      strain: 7.1,
      type: 'Cardio'
    },
    {
      id: '3',
      name: 'HIIT Circuit',
      date: '2 days ago',
      duration: 25,
      calories: 340,
      strain: 9.1,
      type: 'HIIT'
    }
  ]);

  const categories = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga'] as const;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filteredPrograms = selectedCategory === 'All' 
    ? programs 
    : programs.filter(program => program.category === selectedCategory);

  const startQuickWorkout = () => {
    Alert.alert(
      'Quick Workout',
      'Choose your workout type:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Free Training', onPress: () => navigation.navigate('LiveSession', { workoutId: 'free' }) },
        { text: 'HIIT Session', onPress: () => navigation.navigate('LiveSession', { workoutId: 'hiit' }) },
        { text: 'Strength Training', onPress: () => navigation.navigate('LiveSession', { workoutId: 'strength' }) }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStrainColor = (strain: number) => {
    if (strain < 5) return '#22c55e';
    if (strain < 8) return '#f59e0b';
    return '#ef4444';
  };

  const CategorySelector: React.FC = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categorySelector}
      contentContainerStyle={styles.categorySelectorContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const ProgramCard: React.FC<{ program: WorkoutProgram }> = ({ program }) => (
    <TouchableOpacity 
      style={styles.programCard}
      onPress={() => navigation.navigate('ProgramDetail', { programId: program.id })}
    >
      <View style={styles.programHeader}>
        <Text style={styles.programEmoji}>{program.image}</Text>
        <View style={styles.programInfo}>
          <Text style={styles.programName}>{program.name}</Text>
          <Text style={styles.programDescription}>{program.description}</Text>
        </View>
      </View>
      
      <View style={styles.programMeta}>
        <View style={styles.programMetaItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.programMetaText}>{program.duration}</Text>
        </View>
        <View style={styles.programMetaItem}>
          <Ionicons name="fitness-outline" size={14} color="#6B7280" />
          <Text style={styles.programMetaText}>{program.workouts} workouts</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(program.difficulty) }]}>
          <Text style={styles.difficultyText}>{program.difficulty}</Text>
        </View>
      </View>

      {program.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{program.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${program.progress}%` }]} 
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const WorkoutHistoryItem: React.FC<{ workout: RecentWorkout }> = ({ workout }) => (
    <TouchableOpacity 
      style={styles.workoutHistoryItem}
      onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
    >
      <View style={styles.workoutIcon}>
        <Ionicons 
          name={
            workout.type === 'Strength' ? 'barbell' :
            workout.type === 'Cardio' ? 'walk' :
            workout.type === 'HIIT' ? 'flash' : 'fitness'
          } 
          size={20} 
          color="#3B82F6" 
        />
      </View>
      
      <View style={styles.workoutDetails}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <Text style={styles.workoutDate}>{workout.date} • {workout.duration} min</Text>
      </View>
      
      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <Text style={styles.workoutStatValue}>{workout.calories}</Text>
          <Text style={styles.workoutStatLabel}>cal</Text>
        </View>
        <View style={styles.workoutStat}>
          <Text style={[styles.workoutStatValue, { color: getStrainColor(workout.strain) }]}>
            {workout.strain}
          </Text>
          <Text style={styles.workoutStatLabel}>strain</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Training</Text>
        <TouchableOpacity>
          <Ionicons name="calendar-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Quick Start */}
      <View style={styles.section}>
        <LinearGradient 
          colors={['#3B82F6', '#1D4ED8']} 
          style={styles.quickStartCard}
        >
          <View style={styles.quickStartContent}>
            <View>
              <Text style={styles.quickStartTitle}>Ready to Train?</Text>
              <Text style={styles.quickStartSubtitle}>Start a quick workout session</Text>
            </View>
            <TouchableOpacity 
              style={styles.quickStartButton}
              onPress={startQuickWorkout}
            >
              <Ionicons name="play" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Today's Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Recommendation</Text>
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationIcon}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Active Recovery</Text>
            <Text style={styles.recommendationText}>
              Based on your recent strain, consider light cardio or yoga today.
            </Text>
            <TouchableOpacity style={styles.recommendationButton}>
              <Text style={styles.recommendationButtonText}>View Options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Categories */}
      <CategorySelector />

      {/* Training Programs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Training Programs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.programsContainer}>
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.workoutHistory}>
          {recentWorkouts.map((workout) => (
            <WorkoutHistoryItem key={workout.id} workout={workout} />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LiveSession')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.quickActionGradient}>
              <Ionicons name="play-circle" size={32} color="#fff" />
              <Text style={styles.quickActionText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Feature Coming Soon', 'Workout builder will be available soon!')}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.quickActionGradient}>
              <Ionicons name="construct" size={32} color="#fff" />
              <Text style={styles.quickActionText}>Build Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  quickStartCard: {
    borderRadius: 16,
    padding: 20,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  quickStartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
  },
  recommendationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recommendationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categorySelector: {
    marginBottom: 24,
  },
  categorySelectorContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#1F2937',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  programsContainer: {
    gap: 16,
  },
  programCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  programEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  programMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  programMetaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  workoutHistory: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  workoutHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStat: {
    alignItems: 'center',
    marginLeft: 16,
  },
  workoutStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  workoutStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default TrainingScreen;