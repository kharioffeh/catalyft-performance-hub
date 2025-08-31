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
import { Exercise, WorkoutTemplate } from '../types/workout';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

const { width } = Dimensions.get('window');

export default function CreateWorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedExercise } = route.params as { selectedExercise?: Exercise };
  
  const { exercises, templates, startWorkout, addExerciseToWorkout } = useWorkoutStore();
  
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (selectedExercise) {
      setSelectedExercises([selectedExercise]);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [selectedExercise]);

  const handleAddExercise = () => {
    navigation.navigate('ExerciseLibrary');
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleReorderExercises = ({ data }: { data: Exercise[] }) => {
    setSelectedExercises(data);
  };

  const handleStartWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      await startWorkout(workoutName);
      
      // Add exercises to workout
      for (const exercise of selectedExercises) {
        await addExerciseToWorkout(exercise);
      }
      
      navigation.navigate('ActiveWorkout');
    } catch (error) {
      Alert.alert('Error', 'Failed to start workout');
    }
  };

  const handleSaveTemplate = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) {
      Alert.alert('Error', 'Please enter a name and add exercises');
      return;
    }
    
    Alert.alert('Save Template', 'Template saved successfully!');
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

  const renderQuickTemplates = () => (
    <View style={styles.quickTemplatesContainer}>
      <Text style={styles.sectionTitle}>Quick Templates</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {templates.slice(0, 5).map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => {
              // Load template exercises
              const templateExercises = template.exercises.map(te => 
                exercises.find(e => e.id === te.exerciseId)
              ).filter(Boolean) as Exercise[];
              setSelectedExercises(templateExercises);
              setWorkoutName(template.name);
            }}
          >
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateExercises}>
              {template.exercises.length} exercises
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

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
        
        <Text style={styles.headerTitle}>Create Workout</Text>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTemplate}
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

        {/* Quick Templates */}
        {renderQuickTemplates()}

        {/* Exercise List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>
            Exercises ({selectedExercises.length})
          </Text>
          
          {selectedExercises.length > 0 ? (
            <DraggableFlatList
              data={selectedExercises}
              onDragEnd={handleReorderExercises}
              keyExtractor={(item: Exercise) => item.id}
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

        {/* Start Workout Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  quickTemplatesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light.text,
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    elevation: 4,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  templateExercises: {
    fontSize: 12,
    color: theme.colors.light.textSecondary,
  },
  exercisesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  startButton: {
    margin: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  gradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
});