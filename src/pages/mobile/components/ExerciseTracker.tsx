import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  Plus,
  Minus,
  Check,
  X,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import { SessionExercise } from '@/types/training';

interface ExerciseTrackerProps {
  exercises: SessionExercise[];
  onStrainChange: (newStrain: number) => void;
  sessionId: string;
}

interface SetData {
  reps: number;
  load_kg: number;
  completed: boolean;
  rpe?: number;
}

interface ExerciseProgress {
  sets: SetData[];
  completed: boolean;
}

export const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({
  exercises,
  onStrainChange,
  sessionId,
}) => {
  const [exerciseProgress, setExerciseProgress] = useState<{ [key: string]: ExerciseProgress }>(() => {
    const initial: { [key: string]: ExerciseProgress } = {};
    exercises.forEach((exercise, index) => {
      initial[`${index}-${exercise.exercise_id}`] = {
        sets: Array.from({ length: exercise.sets }, () => ({
          reps: exercise.reps,
          load_kg: 0,
          completed: false,
        })),
        completed: false,
      };
    });
    return initial;
  });

  const calculateStrain = () => {
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;

    Object.values(exerciseProgress).forEach((progress) => {
      progress.sets.forEach((set) => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          // Simple strain calculation: reps * load * RPE factor
          const rpeFactor = (set.rpe || 7) / 10;
          totalVolume += set.reps * set.load_kg * rpeFactor;
        }
      });
    });

    // Convert volume to strain scale (0-21)
    // This is a simplified calculation - in reality, you'd use more sophisticated algorithms
    const baseStrain = Math.min(totalVolume / 1000, 15); // Base strain from volume
    const intensityStrain = completedSets > 0 ? (totalSets / completedSets) * 2 : 0; // Intensity factor
    
    return Math.min(baseStrain + intensityStrain, 21);
  };

  const updateSet = (exerciseKey: string, setIndex: number, updates: Partial<SetData>) => {
    setExerciseProgress((prev) => {
      const newProgress = { ...prev };
      newProgress[exerciseKey] = {
        ...newProgress[exerciseKey],
        sets: newProgress[exerciseKey].sets.map((set, index) =>
          index === setIndex ? { ...set, ...updates } : set
        ),
      };

      // Check if exercise is completed
      const allSetsCompleted = newProgress[exerciseKey].sets.every((set) => set.completed);
      newProgress[exerciseKey].completed = allSetsCompleted;

      // Calculate and update strain
      const newStrain = calculateStrain();
      onStrainChange(newStrain);

      return newProgress;
    });
  };

  const toggleSetCompletion = (exerciseKey: string, setIndex: number) => {
    const currentSet = exerciseProgress[exerciseKey]?.sets[setIndex];
    if (!currentSet) return;

    updateSet(exerciseKey, setIndex, {
      completed: !currentSet.completed,
    });
  };

  const updateReps = (exerciseKey: string, setIndex: number, reps: number) => {
    updateSet(exerciseKey, setIndex, { reps: Math.max(0, reps) });
  };

  const updateLoad = (exerciseKey: string, setIndex: number, load: number) => {
    updateSet(exerciseKey, setIndex, { load_kg: Math.max(0, load) });
  };

  const renderExercise = (exercise: SessionExercise, index: number) => {
    const exerciseKey = `${index}-${exercise.exercise_id}`;
    const progress = exerciseProgress[exerciseKey];

    if (!progress) return null;

    return (
      <View key={exerciseKey} style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>
              Exercise {index + 1}
            </Text>
            <Text style={styles.exerciseDetails}>
              {exercise.sets} sets × {exercise.reps} reps
            </Text>
          </View>
          {progress.completed && (
            <View style={styles.completedBadge}>
              <Check size={16} color="#22c55e" />
              <Text style={styles.completedText}>Complete</Text>
            </View>
          )}
        </View>

        <View style={styles.setsContainer}>
          {progress.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setRow}>
              <Text style={styles.setNumber}>{setIndex + 1}</Text>
              
              {/* Reps Input */}
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => updateReps(exerciseKey, setIndex, set.reps - 1)}
                >
                  <Minus size={16} color="#888" />
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={set.reps.toString()}
                  onChangeText={(text) => {
                    const reps = parseInt(text) || 0;
                    updateReps(exerciseKey, setIndex, reps);
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => updateReps(exerciseKey, setIndex, set.reps + 1)}
                >
                  <Plus size={16} color="#888" />
                </TouchableOpacity>
              </View>

              {/* Load Input */}
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => updateLoad(exerciseKey, setIndex, set.load_kg - 2.5)}
                >
                  <Minus size={16} color="#888" />
                </TouchableOpacity>
                <TextInput
                  style={styles.numberInput}
                  value={set.load_kg.toString()}
                  onChangeText={(text) => {
                    const load = parseFloat(text) || 0;
                    updateLoad(exerciseKey, setIndex, load);
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => updateLoad(exerciseKey, setIndex, set.load_kg + 2.5)}
                >
                  <Plus size={16} color="#888" />
                </TouchableOpacity>
              </View>

              {/* Completion Button */}
              <TouchableOpacity
                style={[
                  styles.completionButton,
                  set.completed && styles.completionButtonActive,
                ]}
                onPress={() => toggleSetCompletion(exerciseKey, setIndex)}
              >
                {set.completed ? (
                  <Check size={20} color="#fff" />
                ) : (
                  <View style={styles.completionButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Exercise Stats */}
        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Target size={16} color="#3b82f6" />
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>
              {progress.sets.filter(s => s.completed).length}/{progress.sets.length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={16} color="#f59e0b" />
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>
              {progress.sets
                .filter(s => s.completed)
                .reduce((sum, s) => sum + (s.reps * s.load_kg), 0)
                .toFixed(0)} kg
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const completedExercises = Object.values(exerciseProgress).filter(p => p.completed).length;
  const totalExercises = exercises.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Tracking</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {completedExercises}/{totalExercises} Complete
          </Text>
        </View>
      </View>

      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        {exercises.map((exercise, index) => renderExercise(exercise, index))}
      </ScrollView>

      <View style={styles.labels}>
        <Text style={styles.label}>Set</Text>
        <Text style={styles.label}>Reps</Text>
        <Text style={styles.label}>Load (kg)</Text>
        <Text style={styles.label}>✓</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  progressText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  labels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  exercisesList: {
    maxHeight: 400,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#888',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adjustButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
    minHeight: 40,
  },
  completionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  completionButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  completionButtonInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ExerciseTracker;