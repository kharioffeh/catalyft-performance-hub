import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useWorkoutStore } from '../store/slices/workoutSlice';
import { theme } from '../theme';
import { Exercise, Workout } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

const { width } = Dimensions.get('window');

export default function EditWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutId } = route.params as { workoutId: string };
  
  const { workoutHistory, exercises, updateWorkout, addExerciseToWorkout, removeExerciseFromWorkout, reorderExercises } = useWorkoutStore();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (workoutId && workoutHistory.length > 0) {
      const foundWorkout = workoutHistory.find(w => w.id === workoutId);
      if (foundWorkout) {
        setWorkout(foundWorkout);
        setWorkoutName(foundWorkout.name);
        setSelectedExercises(foundWorkout.exercises.map(ex => ex.exercise));
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [workoutId, workoutHistory]);

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary');
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleReorderExercises = ({ data }: { data: Exercise[] }) => {
    setSelectedExercises(data);
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      // Update workout name
      if (workout) {
        await updateWorkout(workout.id, { name: workoutName });
      }
      
      // Handle exercise changes
      const currentExerciseIds = workout?.exercises.map(ex => ex.exercise.id) || [];
      const newExerciseIds = selectedExercises.map(ex => ex.id);
      
      // Remove exercises that are no longer selected
      for (const exerciseId of currentExerciseIds) {
        if (!newExerciseIds.includes(exerciseId)) {
          await removeExerciseFromWorkout(exerciseId);
        }
      }
      
      // Add new exercises
      for (const exercise of selectedExercises) {
        if (!currentExerciseIds.includes(exercise.id)) {
          await addExerciseToWorkout(exercise);
        }
      }
      
      // Reorder exercises if needed
      if (workout) {
        await reorderExercises(newExerciseIds);
      }
      
      Alert.alert('Success', 'Workout updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update workout');
    }
  };

  const renderExerciseItem = ({ item, drag, isActive, index }: any) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.exerciseItem,
          isActive && styles.exerciseItemActive,
        ]}
      >
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseCategory}>
              {item.muscleGroup} • {item.equipment}
            </Text>
          </View>
          
          <View style={styles.exerciseActions}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveExercise(index)}
            >
              <Ionicons name="close-circle" size={24} color={theme.colors.light.error} />
            </TouchableOpacity>
            
            <View style={styles.dragHandle}>
              <Ionicons name="menu" size={20} color={theme.colors.light.textSecondary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.light.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Workout</Text>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Name Input */}
        <Animated.View
          style={[
            styles.nameInputContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.inputLabel}>Workout Name</Text>
          <TextInput
            style={styles.nameInput}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Enter workout name..."
            placeholderTextColor={theme.colors.light.textTertiary}
          />
        </Animated.View>

        {/* Exercise List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>
            Exercises ({selectedExercises.length})
          </Text>
          
          {selectedExercises.length > 0 ? (
            <DraggableFlatList
              data={selectedExercises}
              onDragEnd={handleReorderExercises}
              keyExtractor={(item) => item.id}
              renderItem={renderExerciseItem}
              contentContainerStyle={styles.exerciseList}
            />
          ) : (
            <View style={styles.emptyExercises}>
              <Ionicons name="fitness-outline" size={48} color={theme.colors.light.textTertiary} />
              <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
              <Text style={styles.emptyExercisesSubtext}>
                Tap the + button to add exercises
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddExercise}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.light.primary,
    borderRadius: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  nameInputContainer: {
    margin: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: theme.colors.light.text,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
  },
  exercisesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseItem: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  exerciseItemActive: {
    backgroundColor: theme.colors.light.primary + '10',
    borderColor: theme.colors.light.primary,
    borderWidth: 2,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 14,
    color: theme.colors.light.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  dragHandle: {
    padding: 4,
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyExercisesText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
});