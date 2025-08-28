import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { Workout, WorkoutStatus } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WorkoutListScreen() {
  const navigation = useNavigation();
  const { workoutHistory, loadWorkoutHistory, workoutHistoryLoading } = useWorkoutStore();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadWorkoutHistory();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
    setRefreshing(false);
  };

  const getStatusColor = (status: WorkoutStatus) => {
    switch (status) {
      case 'completed':
        return theme.colors.light.success;
      case 'in_progress':
        return theme.colors.light.warning;
      case 'planned':
        return theme.colors.light.info;
      default:
        return theme.colors.light.neutral400;
    }
  };

  const getStatusIcon = (status: WorkoutStatus) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'play-circle';
      case 'planned':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const workoutDate = new Date(date);
    const diffTime = Math.abs(today.getTime() - workoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    return workoutDate.toLocaleDateString();
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors = {
      chest: theme.colors.light.primary,
      back: theme.colors.light.secondary,
      legs: theme.colors.light.success,
      shoulders: theme.colors.light.warning,
      arms: theme.colors.light.error,
      core: theme.colors.light.info,
      full_body: theme.colors.light.neutral600,
    };
    return colors[muscleGroup as keyof typeof colors] || theme.colors.light.neutral500;
  };

  const renderWorkoutCard = (workout: Workout, index: number) => {
    const totalVolume = workout.totalVolume || 0;
    const totalSets = workout.totalSets || workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const duration = workout.durationSeconds || 0;
    const muscleGroups = [...new Set(workout.exercises.map(ex => ex.exercise.muscleGroup))];

    return (
      <Animated.View
        key={workout.id}
        style={[
          styles.workoutCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
          activeOpacity={0.9}
        >
          {/* Header with status and date */}
          <View style={styles.cardHeader}>
            <View style={styles.statusContainer}>
              <Ionicons
                name={getStatusIcon(workout.status || 'planned')}
                size={16}
                color={getStatusColor(workout.status || 'planned')}
              />
              <Text style={[styles.statusText, { color: getStatusColor(workout.status || 'planned') }]}>
                {workout.status?.replace('_', ' ').toUpperCase() || 'PLANNED'}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(workout.startedAt)}</Text>
          </View>

          {/* Workout name and description */}
          <Text style={styles.workoutName} numberOfLines={2}>
            {workout.name}
          </Text>

          {/* Exercise thumbnails */}
          <View style={styles.exerciseThumbnails}>
            {workout.exercises.slice(0, 4).map((exercise, idx) => (
              <View key={exercise.id} style={styles.thumbnailContainer}>
                {exercise.exercise.imageUrl ? (
                  <Image
                    source={{ uri: exercise.exercise.imageUrl }}
                    style={styles.exerciseThumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.exercisePlaceholder, { backgroundColor: getMuscleGroupColor(exercise.exercise.muscleGroup) }]}>
                    <Ionicons name="fitness" size={20} color="white" />
                  </View>
                )}
                {idx === 3 && workout.exercises.length > 4 && (
                  <View style={styles.moreExercises}>
                    <Text style={styles.moreExercisesText}>+{workout.exercises.length - 4}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Muscle group tags */}
          <View style={styles.tagsContainer}>
            {muscleGroups.slice(0, 3).map((muscleGroup) => (
              <View
                key={muscleGroup}
                style={[
                  styles.tag,
                  { backgroundColor: getMuscleGroupColor(muscleGroup) + '20' },
                ]}
              >
                <Text style={[styles.tagText, { color: getMuscleGroupColor(muscleGroup) }]}>
                  {muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}
                </Text>
              </View>
            ))}
            {muscleGroups.length > 3 && (
              <View style={styles.moreTags}>
                <Text style={styles.moreTagsText}>+{muscleGroups.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color={theme.colors.light.textSecondary} />
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="layers-outline" size={16} color={theme.colors.light.textSecondary} />
              <Text style={styles.statValue}>{totalSets}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="barbell-outline" size={16} color={theme.colors.light.textSecondary} />
              <Text style={styles.statValue}>{Math.round(totalVolume)}kg</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            {workout.status === 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => navigation.navigate('ShareWorkout', { workoutId: workout.id })}
              >
                <Ionicons name="share-outline" size={16} color={theme.colors.light.primary} />
                <Text style={[styles.actionButtonText, { color: theme.colors.light.primary }]}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="fitness-outline" size={64} color={theme.colors.light.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start your fitness journey by creating your first workout
      </Text>
      <TouchableOpacity
        style={styles.createWorkoutButton}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createWorkoutButtonText}>Create Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateWorkout')}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.gradientIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Workout List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {workoutHistory.length > 0 ? (
          workoutHistory.map((workout, index) => renderWorkoutCard(workout, index))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: theme.colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  workoutCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: theme.colors.light.surface,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.light.textSecondary,
    fontWeight: '500',
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
    lineHeight: 26,
  },
  exerciseThumbnails: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  exerciseThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  exercisePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreExercises: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreExercisesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreTags: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.light.neutral200,
    borderRadius: 16,
  },
  moreTagsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.light.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.light.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.light.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  createWorkoutButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createWorkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});