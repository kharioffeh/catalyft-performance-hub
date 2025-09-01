import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { Workout, PersonalRecord } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryBar, VictoryPie } from 'victory';

const { width, height } = Dimensions.get('window');

export default function WorkoutSummaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { workoutId } = route.params as { workoutId: string };
  
  const { workoutHistory, personalRecords, newPersonalRecords } = useWorkoutStore();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [volumeData, setVolumeData] = useState<Array<{x: number, y: number, label: string}>>([]);
  const [muscleGroupData, setMuscleGroupData] = useState<Array<{x: string, y: number}>>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  useEffect(() => {
    if (workoutId && workoutHistory.length > 0) {
      const foundWorkout = workoutHistory.find(w => w.id === workoutId);
      if (foundWorkout) {
        setWorkout(foundWorkout);
        generateChartData();
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            // Animation configuration
            tension: 100,
            friction: 8,
          }),
        ]).start();

        // Show celebration if there are new PRs
        if (newPersonalRecords.length > 0) {
          setTimeout(() => setCelebrationVisible(true), 1000);
        }
      }
    }
  }, [workoutId, workoutHistory]);

  const generateChartData = () => {
    // Generate volume trend data (last 7 workouts)
    const recentWorkouts = workoutHistory.slice(0, 7).reverse();
    const volumeTrend = recentWorkouts.map((w, index) => ({
      x: index + 1,
      y: w.totalVolume || 0,
      label: w.name,
    }));
    setVolumeData(volumeTrend);

    // Generate muscle group distribution
    const muscleGroups: Record<string, number> = {};
    workout?.exercises.forEach(ex => {
      const group = ex.exercise.muscleGroup;
      muscleGroups[group] = (muscleGroups[group] || 0) + 1;
    });

    const muscleData = Object.entries(muscleGroups).map(([group, count]) => ({
      x: group.replace('_', ' '),
      y: count,
    }));
    setMuscleGroupData(muscleData);
  };

  const handleShare = () => {
    Alert.alert('Share Workout', 'Share your workout achievement!');
  };

  const handleSaveTemplate = () => {
    Alert.alert('Save Template', 'Save this workout as a template for future use?');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.light.text} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Workout Summary</Text>
      
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color={theme.colors.light.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderWorkoutStats = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={theme.gradients.workout}
        style={styles.statsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsContent}>
          <Text style={styles.workoutName}>{workout?.name}</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text style={styles.statValue}>{Math.floor((workout?.durationSeconds || 0) / 60)}m</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💪</Text>
              <Text style={styles.statValue}>{workout?.totalSets || 0}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{Math.round(workout?.totalVolume || 0)}kg</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderVolumeChart = () => (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}],
        },
      ]}
    >
      <Text style={styles.chartTitle}>Volume Trend</Text>
      <View style={styles.chartWrapper}>
        <VictoryChart
          width={width - 40}
          height={200}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryArea
            data={volumeData}
            style={{
              data: {
                fill: theme.colors.light.primary + '30',
                stroke: theme.colors.light.primary,
                strokeWidth: 3,
              },
            }}
          />
          <VictoryLine
            data={volumeData}
            style={{
              data: {
                stroke: theme.colors.light.primary,
                strokeWidth: 3,
              },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: theme.colors.light.border },
              tickLabels: { fill: theme.colors.light.textSecondary, fontSize: 12 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.light.border },
              tickLabels: { fill: theme.colors.light.textSecondary, fontSize: 12 },
            }}
          />
        </VictoryChart>
      </View>
    </Animated.View>
  );

  const renderMuscleGroupChart = () => (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}],
        },
      ]}
    >
      <Text style={styles.chartTitle}>Muscle Group Distribution</Text>
      <View style={styles.chartWrapper}>
        <VictoryPie
          data={muscleGroupData}
          width={width - 40}
          height={200}
          colorScale={[
            theme.colors.light.primary,
            theme.colors.light.secondary,
            theme.colors.light.success,
            theme.colors.light.warning,
            theme.colors.light.error,
            theme.colors.light.info,
          ]}
          innerRadius={40}
          labelRadius={({ innerRadius }: any) => (innerRadius || 0) + 20}
          style={{
            labels: {
              fill: theme.colors.light.text,
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        />
      </View>
    </Animated.View>
  );

  const renderPersonalRecords = () => {
    const workoutPRs = personalRecords.filter(pr => pr.workoutId === workoutId);
    if (workoutPRs.length === 0) return null;

    return (
      <Animated.View
        style={[
          styles.prContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })}],
          },
        ]}
      >
        <Text style={styles.prTitle}>🏆 New Personal Records!</Text>
        {workoutPRs.map((pr, index) => (
          <View key={pr.id} style={styles.prCard}>
            <LinearGradient
              colors={theme.gradients.success}
              style={styles.prGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.prContent}>
                <View style={styles.prIcon}>
                  <Ionicons name="trophy" size={24} color="white" />
                </View>
                <View style={styles.prInfo}>
                  <Text style={styles.prExerciseName}>{pr.exerciseName}</Text>
                  <Text style={styles.prDetails}>
                    {pr.weight}kg × {pr.reps} reps
                  </Text>
                  <Text style={styles.prOneRM}>
                    1RM: {Math.round(pr.oneRepMax)}kg
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </Animated.View>
    );
  };

  const renderCelebration = () => {
    if (!celebrationVisible) return null;

    return (
      <Animated.View style={styles.celebrationOverlay}>
        <LinearGradient
          colors={theme.gradients.success}
          style={styles.celebrationGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.celebrationContent}>
            <Ionicons name="trophy" size={64} color="white" />
            <Text style={styles.celebrationTitle}>🎉 New PRs!</Text>
            <Text style={styles.celebrationSubtitle}>
              You've set {newPersonalRecords.length} new personal record{newPersonalRecords.length > 1 ? 's' : ''}!
            </Text>
            <TouchableOpacity
              style={styles.celebrationButton}
              onPress={() => setCelebrationVisible(false)}
            >
              <Text style={styles.celebrationButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderConfetti = () => {
    if (!celebrationVisible) return null;

    return (
      <Animated.View style={[styles.confettiContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
          style={styles.confettiGradient}
        >
          <Ionicons name="trophy" size={64} color="white" />
          <Text style={styles.confettiTitle}>🎉 New PRs!</Text>
          <Text style={styles.confettiSubtitle}>
            You've set {newPersonalRecords.length} new personal record{newPersonalRecords.length > 1 ? 's' : ''}!
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderActionButtons = () => (
    <Animated.View
      style={[
        styles.actionButtonsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })}],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleSaveTemplate}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="bookmark-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Save as Template</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('WorkoutList')}
      >
        <LinearGradient
          colors={theme.gradients.secondary}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="list-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>View All Workouts</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout summary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderWorkoutStats()}
        {renderVolumeChart()}
        {renderMuscleGroupChart()}
        {renderPersonalRecords()}
        {renderActionButtons()}
        
        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <LinearGradient colors={['#0057FF', '#003FCC']} style={styles.shareButtonGradient}>
            <Ionicons name="share" size={20} color="white" />
            <Text style={styles.shareText}>Share Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderConfetti()}
      {renderCelebration()}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsContainer: {
    margin: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statsGradient: {
    borderRadius: 24,
    padding: 24,
  },
  statsContent: {
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  chartContainer: {
    margin: 20,
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  prContainer: {
    margin: 20,
  },
  prTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  prCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  prGradient: {
    borderRadius: 16,
    padding: 16,
  },
  prContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  prIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prInfo: {
    flex: 1,
  },
  prExerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  prDetails: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 2,
  },
  prOneRM: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  actionButtonsContainer: {
    margin: 20,
    gap: 16,
  },
  actionButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationGradient: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    maxWidth: width - 80,
  },
  celebrationContent: {
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  celebrationButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  celebrationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
  },
  // New Component Styles
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiGradient: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: width - 80,
  },
  confettiTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  confettiSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  shareButton: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  shareButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shareText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});