import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useAuth } from '../../hooks/useAuth';
import { ariaService } from '../../services/ai/openai';
import { WorkoutRequirements, WorkoutPlan } from '../../types/ai';
import WorkoutCard from '../../components/aria/WorkoutCard';
import { useNavigation } from '@react-navigation/native';

const WorkoutGeneratorScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Form state
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'max'>('moderate');
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'hybrid' | 'flexibility' | 'recovery'>('strength');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes'
  ];
  
  const equipment = [
    'Barbell', 'Dumbbells', 'Cables', 'Machines', 'Bodyweight', 
    'Resistance Bands', 'Kettlebells', 'Pull-up Bar', 'Bench'
  ];
  
  const fitnessGoals = [
    'Build Muscle', 'Lose Fat', 'Increase Strength', 'Improve Endurance',
    'Better Mobility', 'Athletic Performance', 'Rehabilitation'
  ];
  
  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };
  
  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item)
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };
  
  const toggleGoal = (goal: string) => {
    setGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };
  
  const generateWorkout = async () => {
    if (!user) return;
    
    if (selectedMuscles.length === 0 && workoutType === 'strength') {
      Alert.alert('Select Muscles', 'Please select at least one muscle group for strength training.');
      return;
    }
    
    if (selectedEquipment.length === 0) {
      Alert.alert('Select Equipment', 'Please select at least one equipment option.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const requirements: WorkoutRequirements = {
        duration,
        equipment: selectedEquipment,
        muscleGroups: selectedMuscles,
        intensity,
        type: workoutType,
        goals,
        avoid,
      };
      
      const plan = await ariaService.generateWorkoutPlan(user.id, requirements);
      setGeneratedPlan(plan);
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Generation Failed', 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const startWorkout = () => {
    if (generatedPlan) {
      // Navigate to workout tracking screen with the plan
      navigation.navigate('WorkoutTracking', { plan: generatedPlan });
    }
  };
  
  const saveWorkout = async () => {
    if (generatedPlan && user) {
      try {
        // Save workout plan to user's library
        Alert.alert('Saved!', 'Workout plan saved to your library.');
      } catch (error) {
        Alert.alert('Error', 'Failed to save workout plan.');
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>AI Workout Generator</Text>
          <Text style={styles.headerSubtitle}>
            Let ARIA create your perfect workout
          </Text>
        </LinearGradient>
        
        {!generatedPlan ? (
          <View style={styles.form}>
            {/* Workout Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Workout Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['strength', 'cardio', 'hybrid', 'flexibility', 'recovery'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      workoutType === type && styles.typeButtonActive
                    ]}
                    onPress={() => setWorkoutType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      workoutType === type && styles.typeButtonTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Duration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Duration</Text>
                <Text style={styles.durationValue}>{duration} minutes</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={120}
                step={5}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor="#667eea"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#667eea"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>15 min</Text>
                <Text style={styles.sliderLabel}>120 min</Text>
              </View>
            </View>
            
            {/* Intensity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Intensity</Text>
              <View style={styles.intensityButtons}>
                {(['low', 'moderate', 'high', 'max'] as const).map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.intensityButton,
                      intensity === level && styles.intensityButtonActive
                    ]}
                    onPress={() => setIntensity(level)}
                  >
                    <Icon
                      name={
                        level === 'low' ? 'battery-dead' :
                        level === 'moderate' ? 'battery-half' :
                        level === 'high' ? 'battery-charging' :
                        'battery-full'
                      }
                      size={24}
                      color={intensity === level ? '#fff' : '#666'}
                    />
                    <Text style={[
                      styles.intensityText,
                      intensity === level && styles.intensityTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Muscle Groups (for strength training) */}
            {workoutType === 'strength' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Muscle Groups</Text>
                <View style={styles.chipContainer}>
                  {muscleGroups.map(muscle => (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.chip,
                        selectedMuscles.includes(muscle) && styles.chipActive
                      ]}
                      onPress={() => toggleMuscle(muscle)}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedMuscles.includes(muscle) && styles.chipTextActive
                      ]}>
                        {muscle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Equipment</Text>
              <View style={styles.chipContainer}>
                {equipment.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      selectedEquipment.includes(item) && styles.chipActive
                    ]}
                    onPress={() => toggleEquipment(item)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedEquipment.includes(item) && styles.chipTextActive
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goals (Optional)</Text>
              <View style={styles.chipContainer}>
                {fitnessGoals.map(goal => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.chip,
                      goals.includes(goal) && styles.chipActive
                    ]}
                    onPress={() => toggleGoal(goal)}
                  >
                    <Text style={[
                      styles.chipText,
                      goals.includes(goal) && styles.chipTextActive
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Advanced Options */}
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>Advanced Options</Text>
              <Icon
                name={showAdvanced ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#667eea"
              />
            </TouchableOpacity>
            
            {showAdvanced && (
              <View style={styles.advancedSection}>
                <Text style={styles.inputLabel}>Exercises to Avoid</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., squats, deadlifts (comma separated)"
                  value={avoid.join(', ')}
                  onChangeText={(text) => setAvoid(text.split(',').map(s => s.trim()))}
                />
                
                <Text style={styles.inputLabel}>Special Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Any injuries, preferences, or special requirements..."
                  value={specialNotes}
                  onChangeText={setSpecialNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            
            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateWorkout}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.generateButtonGradient}
              >
                {isGenerating ? (
                  <>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.generateButtonText}>Generating...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generate Workout</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Your AI-Generated Workout</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={() => setGeneratedPlan(null)}
              >
                <Icon name="refresh" size={20} color="#667eea" />
                <Text style={styles.regenerateText}>New Plan</Text>
              </TouchableOpacity>
            </View>
            
            {generatedPlan.workouts.map((workout, index) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={startWorkout}
              />
            ))}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
                <Icon name="bookmark-outline" size={20} color="#667eea" />
                <Text style={styles.saveButtonText}>Save to Library</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.startNowButton} onPress={startWorkout}>
                <LinearGradient
                  colors={['#00C851', '#00A846']}
                  style={styles.startNowGradient}
                >
                  <Icon name="play" size={20} color="#fff" />
                  <Text style={styles.startNowText}>Start Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  intensityButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  intensityText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  intensityTextActive: {
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 10,
  },
  advancedToggleText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  advancedSection: {
    paddingTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    marginTop: 20,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  regenerateText: {
    color: '#667eea',
    marginLeft: 5,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  saveButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  startNowButton: {
    flex: 1,
    marginLeft: 10,
  },
  startNowGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default WorkoutGeneratorScreen;