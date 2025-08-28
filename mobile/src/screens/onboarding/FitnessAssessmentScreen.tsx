import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AnalyticsService, { EVENTS } from '../../services/analytics';

interface AssessmentData {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  workoutFrequency: number | null;
  availableEquipment: string[];
  injuries: string[];
  timeAvailability: number | null;
}

const fitnessLevels = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to fitness or returning after a break',
    icon: 'leaf-outline',
    color: '#A8E6CF',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Working out regularly for 6+ months',
    icon: 'fitness-outline',
    color: '#FFD93D',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Experienced athlete with 2+ years training',
    icon: 'trophy-outline',
    color: '#FF6B6B',
  },
];

const equipment = [
  { id: 'none', label: 'No Equipment', icon: 'body-outline' },
  { id: 'dumbbells', label: 'Dumbbells', icon: 'barbell-outline' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: 'expand-outline' },
  { id: 'kettlebells', label: 'Kettlebells', icon: 'fitness-outline' },
  { id: 'barbell', label: 'Barbell', icon: 'barbell-outline' },
  { id: 'pull_up_bar', label: 'Pull-up Bar', icon: 'resize-outline' },
  { id: 'gym_access', label: 'Full Gym Access', icon: 'business-outline' },
  { id: 'home_gym', label: 'Home Gym', icon: 'home-outline' },
];

const commonInjuries = [
  'Lower Back',
  'Knee',
  'Shoulder',
  'Ankle',
  'Wrist',
  'Hip',
  'Neck',
  'Elbow',
];

const FitnessAssessmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const goals = route.params?.goals || [];

  const [assessment, setAssessment] = useState<AssessmentData>({
    fitnessLevel: null,
    workoutFrequency: null,
    availableEquipment: [],
    injuries: [],
    timeAvailability: null,
  });

  const [customInjury, setCustomInjury] = useState('');

  const handleFitnessLevelSelect = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setAssessment(prev => ({ ...prev, fitnessLevel: level }));
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    setAssessment(prev => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(equipmentId)
        ? prev.availableEquipment.filter(id => id !== equipmentId)
        : [...prev.availableEquipment, equipmentId],
    }));
  };

  const handleInjuryToggle = (injury: string) => {
    setAssessment(prev => ({
      ...prev,
      injuries: prev.injuries.includes(injury)
        ? prev.injuries.filter(i => i !== injury)
        : [...prev.injuries, injury],
    }));
  };

  const addCustomInjury = () => {
    if (customInjury.trim()) {
      handleInjuryToggle(customInjury.trim());
      setCustomInjury('');
    }
  };

  const handleContinue = () => {
    if (!assessment.fitnessLevel || assessment.workoutFrequency === null) {
      // Show validation error
      return;
    }

    AnalyticsService.track(EVENTS.FITNESS_LEVEL_SET, {
      fitness_level: assessment.fitnessLevel,
      workout_frequency: assessment.workoutFrequency,
      equipment_count: assessment.availableEquipment.length,
      has_injuries: assessment.injuries.length > 0,
      time_availability: assessment.timeAvailability,
    });

    navigation.navigate('Personalization', { goals, assessment });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Let's assess your fitness</Text>
        <Text style={styles.subtitle}>
          This helps us create the perfect plan for you
        </Text>

        {/* Fitness Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's your fitness level?</Text>
          <View style={styles.optionsContainer}>
            {fitnessLevels.map(level => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  assessment.fitnessLevel === level.id && styles.levelCardSelected,
                  { borderColor: assessment.fitnessLevel === level.id ? level.color : '#E0E0E0' },
                ]}
                onPress={() => handleFitnessLevelSelect(level.id as any)}
              >
                <Ionicons name={level.icon as any} size={32} color={level.color} />
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How often do you want to work out?</Text>
          <View style={styles.frequencyContainer}>
            {[2, 3, 4, 5, 6, 7].map(days => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.frequencyButton,
                  assessment.workoutFrequency === days && styles.frequencyButtonSelected,
                ]}
                onPress={() => setAssessment(prev => ({ ...prev, workoutFrequency: days }))}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    assessment.workoutFrequency === days && styles.frequencyTextSelected,
                  ]}
                >
                  {days}
                </Text>
                <Text style={styles.frequencyLabel}>days/week</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Available Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What equipment do you have access to?</Text>
          <View style={styles.equipmentGrid}>
            {equipment.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.equipmentItem,
                  assessment.availableEquipment.includes(item.id) && styles.equipmentItemSelected,
                ]}
                onPress={() => handleEquipmentToggle(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={assessment.availableEquipment.includes(item.id) ? '#6C63FF' : '#666'}
                />
                <Text
                  style={[
                    styles.equipmentLabel,
                    assessment.availableEquipment.includes(item.id) && styles.equipmentLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Injuries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Any injuries we should know about?</Text>
          <Text style={styles.sectionSubtitle}>
            We'll avoid exercises that might aggravate these areas
          </Text>
          <View style={styles.injuryContainer}>
            {commonInjuries.map(injury => (
              <TouchableOpacity
                key={injury}
                style={[
                  styles.injuryChip,
                  assessment.injuries.includes(injury) && styles.injuryChipSelected,
                ]}
                onPress={() => handleInjuryToggle(injury)}
              >
                <Text
                  style={[
                    styles.injuryText,
                    assessment.injuries.includes(injury) && styles.injuryTextSelected,
                  ]}
                >
                  {injury}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customInjuryContainer}>
            <TextInput
              style={styles.customInjuryInput}
              placeholder="Other injury (specify)"
              value={customInjury}
              onChangeText={setCustomInjury}
              onSubmitEditing={addCustomInjury}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomInjury}
              disabled={!customInjury.trim()}
            >
              <Ionicons name="add" size={24} color={customInjury.trim() ? '#6C63FF' : '#CCC'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How much time can you dedicate per workout?</Text>
          <View style={styles.timeContainer}>
            {[15, 30, 45, 60, 90].map(minutes => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.timeButton,
                  assessment.timeAvailability === minutes && styles.timeButtonSelected,
                ]}
                onPress={() => setAssessment(prev => ({ ...prev, timeAvailability: minutes }))}
              >
                <Text
                  style={[
                    styles.timeText,
                    assessment.timeAvailability === minutes && styles.timeTextSelected,
                  ]}
                >
                  {minutes}
                </Text>
                <Text style={styles.timeLabel}>min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!assessment.fitnessLevel || assessment.workoutFrequency === null) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!assessment.fitnessLevel || assessment.workoutFrequency === null}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 12,
  },
  levelCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    alignItems: 'center',
  },
  levelCardSelected: {
    borderWidth: 2,
    elevation: 3,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  frequencyButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: 80,
  },
  frequencyButtonSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  frequencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  frequencyTextSelected: {
    color: '#6C63FF',
  },
  frequencyLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: 100,
  },
  equipmentItemSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  equipmentLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  equipmentLabelSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  injuryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  injuryChip: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  injuryChipSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B10',
  },
  injuryText: {
    fontSize: 14,
    color: '#666',
  },
  injuryTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  customInjuryContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  customInjuryInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: 'white',
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  timeButtonSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  timeTextSelected: {
    color: '#6C63FF',
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FitnessAssessmentScreen;