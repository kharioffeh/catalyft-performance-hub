import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { WorkoutExercise, WorkoutSet } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function ActiveWorkoutScreen() {
  const navigation = useNavigation();
  const {
    currentWorkout,
    workoutTimer,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    cancelWorkout,
    completeSet,
    updateSet,
    addSet,
    startRestTimer,
    restTimer,
  } = useWorkoutStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerScaleAnim = useRef(new Animated.Value(1)).current;
  const setCardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentWorkout) {
      updateTimerDisplay();
      updateProgress();
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentWorkout]);

  useEffect(() => {
    if (restTimer) {
      startRestCountdown();
    }
  }, [restTimer]);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      updateTimerDisplay();
      updateProgress();
    }, 1000);
  };

  const updateTimerDisplay = () => {
    if (currentWorkout && workoutTimer.startTime) {
      const elapsed = Math.floor((Date.now() - workoutTimer.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimerDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const updateProgress = () => {
    if (currentWorkout) {
      const totalSets = currentWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      const completedSets = currentWorkout.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter(set => set.completed).length,
        0
      );
      const newProgress = totalSets > 0 ? completedSets / totalSets : 0;
      setProgress(newProgress);

      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  const startRestCountdown = () => {
    if (restTimer) {
      const countdown = setInterval(() => {
        // Rest timer countdown logic would go here
        // For now, just simulate
      }, 1000);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeWorkout();
      setIsPaused(false);
      startTimer();
    } else {
      pauseWorkout();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'destructive',
          onPress: () => {
            finishWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSetComplete = async (exerciseId: string, setId: string) => {
    await completeSet(exerciseId, setId);
    updateProgress();
    
    // Start rest timer
    const exercise = currentWorkout?.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    if (exercise && set) {
      startRestTimer(90, exercise.exercise.name, set.setNumber);
    }
  };

  const handleSetUpdate = async (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    await updateSet(exerciseId, setId, updates);
  };

  const handleAddSet = async (exerciseId: string) => {
    await addSet(exerciseId);
    updateProgress();
  };

  const renderTimer = () => (
    <View style={styles.timerContainer}>
      <LinearGradient
        colors={theme.gradients.workout}
        style={styles.timerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.timerContent}>
          <Text style={styles.timerLabel}>WORKOUT TIME</Text>
          <Animated.Text
            style={[
              styles.timerDisplay,
              {
                transform: [{ scale: timerScaleAnim }],
              },
            ]}
          >
            {timerDisplay}
          </Animated.Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              style={styles.timerButton}
              onPress={handlePauseResume}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerButton, styles.stopButton]}
              onPress={handleCancelWorkout}
            >
              <Ionicons name="stop" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% Complete
        </Text>
      </View>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );

  const renderExerciseCard = (exercise: WorkoutExercise, exerciseIndex: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      {/* Large Exercise Display with Video */}
      <View style={styles.exerciseSection}>
        {exercise.exercise.videoUrl ? (
          <Video
            source={{ uri: exercise.exercise.videoUrl }}
            style={styles.exerciseVideo}
            repeat
            muted
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
          />
        ) : (
          <View style={styles.exerciseVideoPlaceholder}>
            <Ionicons name="fitness-outline" size={48} color={theme.colors.light.textTertiary} />
          </View>
        )}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.videoOverlay}
        >
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
          <Text style={styles.targetMuscles}>{exercise.exercise.muscleGroup}</Text>
        </LinearGradient>
      </View>

      <View style={styles.setsContainer}>
        {exercise.sets.map((set, setIndex) => (
          <EnhancedSetCard
            key={set.id}
            set={set}
            exerciseId={exercise.id}
            onComplete={handleSetComplete}
            onUpdate={handleSetUpdate}
            isActive={exerciseIndex === currentExerciseIndex && setIndex === currentSetIndex}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.addSetButton}
        onPress={() => handleAddSet(exercise.id)}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.addSetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addSetText}>Add Set</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderRestTimer = () => {
    if (!restTimer) return null;

    return (
      <View style={styles.restTimerContainer}>
        <LinearGradient
          colors={theme.gradients.rest}
          style={styles.restTimerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.restTimerContent}>
            <Ionicons name="timer-outline" size={32} color="white" />
            <Text style={styles.restTimerTitle}>Rest Time</Text>
            <Text style={styles.restTimerExercise}>
              {restTimer.exerciseName} - Set {restTimer.setNumber}
            </Text>
            <Text style={styles.restTimerCountdown}>01:30</Text>
            <TouchableOpacity
              style={styles.skipRestButton}
              onPress={() => {/* Skip rest timer logic */}}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (!currentWorkout) {
    return (
      <View style={styles.container}>
        <View style={styles.noWorkoutContainer}>
          <Ionicons name="fitness-outline" size={64} color={theme.colors.light.textTertiary} />
          <Text style={styles.noWorkoutTitle}>No Active Workout</Text>
          <Text style={styles.noWorkoutSubtitle}>
            Start a workout to begin tracking your progress
          </Text>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => navigation.navigate('CreateWorkout')}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Section */}
        {renderTimer()}

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Rest Timer Overlay */}
        {renderRestTimer()}

        {/* Exercises */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.exercisesTitle}>Exercises</Text>
          {currentWorkout.exercises.map((exercise, index) =>
            renderExerciseCard(exercise, index)
          )}
        </View>

        {/* Finish Workout Button */}
        <TouchableOpacity
          style={styles.finishWorkoutButton}
          onPress={handleFinishWorkout}
        >
          <LinearGradient
            colors={theme.gradients.success}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.finishWorkoutButtonText}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

// Enhanced Set Card Component with Large Touch-Friendly Inputs
const EnhancedSetCard = ({ set, exerciseId, onComplete, onUpdate, isActive }) => {
  const [weight, setWeight] = useState(set.weight?.toString() || '');
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [rpe, setRpe] = useState(set.rpe?.toString() || '');

  const handleComplete = () => {
    if (weight && reps) {
      onUpdate(exerciseId, set.id, {
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rpe: rpe ? parseInt(rpe) : undefined,
        completed: true,
      });
      onComplete(exerciseId, set.id);
    }
  };

  const incrementWeight = () => {
    const currentWeight = parseFloat(weight) || 0;
    setWeight((currentWeight + 2.5).toString());
  };

  const decrementWeight = () => {
    const currentWeight = parseFloat(weight) || 0;
    if (currentWeight >= 2.5) {
      setWeight((currentWeight - 2.5).toString());
    }
  };

  const incrementReps = () => {
    const currentReps = parseInt(reps) || 0;
    setReps((currentReps + 1).toString());
  };

  const decrementReps = () => {
    const currentReps = parseInt(reps) || 0;
    if (currentReps > 0) {
      setReps((currentReps - 1).toString());
    }
  };

  return (
    <View style={[styles.enhancedSetCard, isActive && styles.activeSetCard]}>
      <View style={styles.setHeader}>
        <Text style={styles.setNumber}>Set {set.setNumber}</Text>
        {set.completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.light.success} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>

      {!set.completed && (
        <>
          {/* Large Weight Input Controls */}
          <View style={styles.setTracker}>
            <Text style={styles.setIndicator}>Set {set.setNumber} of {exercise.sets.length}</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputControl}>
                <Text style={styles.inputLabel}>WEIGHT</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => {
                      decrementWeight();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.controlButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.valueDisplay}>
                    <Text style={styles.mainValue}>{weight || '0'}</Text>
                    <Text style={styles.unit}>lbs</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => {
                      incrementWeight();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Large Reps Input Controls */}
          <View style={styles.setTracker}>
            <View style={styles.inputGroup}>
              <View style={styles.inputControl}>
                <Text style={styles.inputLabel}>REPS</Text>
                <View style={styles.inputRow}>
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => {
                      decrementReps();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.controlButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.valueDisplay}>
                    <Text style={styles.mainValue}>{reps || '0'}</Text>
                    <Text style={styles.unit}>reps</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => {
                      incrementReps();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* RPE Input */}
          <View style={styles.rpeContainer}>
            <Text style={styles.setLabel}>RPE (Rate of Perceived Exertion)</Text>
            <TextInput
              style={styles.rpeInput}
              value={rpe}
              onChangeText={setRpe}
              keyboardType="numeric"
              placeholder="1-10"
              placeholderTextColor={theme.colors.light.textTertiary}
              maxLength={2}
            />
          </View>

          {/* Large Complete Button */}
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={['#00C853', '#00A041']} 
              style={styles.completeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Complete Set</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  timerContainer: {
    margin: 20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  timerGradient: {
    borderRadius: 24,
    padding: 24,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16,
  },
  timerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.light.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.light.primary,
    borderRadius: 4,
  },
  restTimerContainer: {
    margin: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  restTimerGradient: {
    borderRadius: 20,
    padding: 24,
  },
  restTimerContent: {
    alignItems: 'center',
  },
  restTimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  restTimerExercise: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 16,
  },
  restTimerCountdown: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  skipRestButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  skipRestText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  exerciseSection: {
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  exerciseVideo: {
    height: 250,
    width: '100%',
    backgroundColor: '#000',
  },
  exerciseVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  targetMuscles: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  setsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  enhancedSetCard: {
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeSetCard: {
    borderColor: theme.colors.light.primary,
    backgroundColor: theme.colors.light.primary + '10',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  setNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.success,
  },
  setTracker: {
    marginBottom: 24,
  },
  setIndicator: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    gap: 24,
  },
  inputControl: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.light.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
  },
  valueDisplay: {
    minWidth: 100,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rpeContainer: {
    marginBottom: 24,
  },
  rpeInput: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.light.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: theme.colors.light.border,
  },
  completeButton: {
    marginHorizontal: 20,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completeButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addSetButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addSetGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addSetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  finishWorkoutButton: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  finishWorkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  noWorkoutSubtitle: {
    fontSize: 16,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  startWorkoutButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  startWorkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});