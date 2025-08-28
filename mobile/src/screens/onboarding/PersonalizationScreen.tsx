import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AnalyticsService from '../../services/analytics';

interface PersonalizationData {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;
  weight?: number;
  preferredWorkoutTimes: string[];
  dietaryPreferences: string[];
  notificationPreferences: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    socialNotifications: boolean;
    mealReminders: boolean;
    motivationalQuotes: boolean;
  };
}

const workoutTimes = [
  { id: 'early_morning', label: 'Early Morning', time: '5:00 - 7:00', icon: 'sunny-outline' },
  { id: 'morning', label: 'Morning', time: '7:00 - 10:00', icon: 'partly-sunny-outline' },
  { id: 'midday', label: 'Midday', time: '11:00 - 14:00', icon: 'sunny-outline' },
  { id: 'afternoon', label: 'Afternoon', time: '14:00 - 17:00', icon: 'partly-sunny-outline' },
  { id: 'evening', label: 'Evening', time: '17:00 - 20:00', icon: 'moon-outline' },
  { id: 'night', label: 'Night', time: '20:00 - 23:00', icon: 'moon-outline' },
];

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'High-Protein',
  'Intermittent Fasting',
];

const PersonalizationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { goals, assessment } = route.params || {};

  const [personalization, setPersonalization] = useState<PersonalizationData>({
    preferredWorkoutTimes: [],
    dietaryPreferences: [],
    notificationPreferences: {
      workoutReminders: true,
      progressUpdates: true,
      socialNotifications: true,
      mealReminders: false,
      motivationalQuotes: true,
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const handleGenderSelect = (gender: PersonalizationData['gender']) => {
    setPersonalization(prev => ({ ...prev, gender }));
  };

  const handleWorkoutTimeToggle = (timeId: string) => {
    setPersonalization(prev => ({
      ...prev,
      preferredWorkoutTimes: prev.preferredWorkoutTimes.includes(timeId)
        ? prev.preferredWorkoutTimes.filter(id => id !== timeId)
        : [...prev.preferredWorkoutTimes, timeId],
    }));
  };

  const handleDietaryToggle = (diet: string) => {
    setPersonalization(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(diet)
        ? prev.dietaryPreferences.filter(d => d !== diet)
        : [...prev.dietaryPreferences, diet],
    }));
  };

  const handleNotificationToggle = (key: keyof PersonalizationData['notificationPreferences']) => {
    setPersonalization(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key],
      },
    }));
  };

  const calculateAge = (date: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
      setPersonalization(prev => ({ ...prev, age: calculateAge(selectedDate) }));
    }
  };

  const handleContinue = () => {
    // Track personalization data
    AnalyticsService.setUserProperties({
      age: personalization.age,
      gender: personalization.gender,
      height: personalization.height,
      weight: personalization.weight,
      preferred_workout_times: personalization.preferredWorkoutTimes,
      dietary_preferences: personalization.dietaryPreferences,
      notification_preferences: personalization.notificationPreferences,
    });

    navigation.navigate('PlanSelection', {
      goals,
      assessment,
      personalization,
    });
  };

  const handleSkip = () => {
    navigation.navigate('PlanSelection', {
      goals,
      assessment,
      personalization: {},
    });
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
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Let's personalize your experience</Text>
        <Text style={styles.subtitle}>
          This information helps us create better recommendations (all optional)
        </Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderContainer}>
              {[
                { id: 'male', label: 'Male', icon: 'male' },
                { id: 'female', label: 'Female', icon: 'female' },
                { id: 'other', label: 'Other', icon: 'transgender' },
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.genderButton,
                    personalization.gender === option.id && styles.genderButtonSelected,
                  ]}
                  onPress={() => handleGenderSelect(option.id as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={personalization.gender === option.id ? '#6C63FF' : '#666'}
                  />
                  <Text
                    style={[
                      styles.genderText,
                      personalization.gender === option.id && styles.genderTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {birthDate ? birthDate.toLocaleDateString() : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Height & Weight */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="170"
                keyboardType="numeric"
                value={personalization.height?.toString() || ''}
                onChangeText={text => {
                  const height = parseInt(text) || undefined;
                  setPersonalization(prev => ({ ...prev, height }));
                }}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="70"
                keyboardType="numeric"
                value={personalization.weight?.toString() || ''}
                onChangeText={text => {
                  const weight = parseInt(text) || undefined;
                  setPersonalization(prev => ({ ...prev, weight }));
                }}
              />
            </View>
          </View>
        </View>

        {/* Preferred Workout Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When do you prefer to work out?</Text>
          <View style={styles.timeGrid}>
            {workoutTimes.map(time => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.timeCard,
                  personalization.preferredWorkoutTimes.includes(time.id) && styles.timeCardSelected,
                ]}
                onPress={() => handleWorkoutTimeToggle(time.id)}
              >
                <Ionicons
                  name={time.icon as any}
                  size={24}
                  color={
                    personalization.preferredWorkoutTimes.includes(time.id) ? '#6C63FF' : '#666'
                  }
                />
                <Text
                  style={[
                    styles.timeLabel,
                    personalization.preferredWorkoutTimes.includes(time.id) && styles.timeLabelSelected,
                  ]}
                >
                  {time.label}
                </Text>
                <Text style={styles.timeRange}>{time.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.dietaryContainer}>
            {dietaryOptions.map(diet => (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.dietaryChip,
                  personalization.dietaryPreferences.includes(diet) && styles.dietaryChipSelected,
                ]}
                onPress={() => handleDietaryToggle(diet)}
              >
                <Text
                  style={[
                    styles.dietaryText,
                    personalization.dietaryPreferences.includes(diet) && styles.dietaryTextSelected,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.notificationContainer}>
            {[
              { key: 'workoutReminders', label: 'Workout Reminders', icon: 'fitness-outline' },
              { key: 'progressUpdates', label: 'Progress Updates', icon: 'trending-up-outline' },
              { key: 'socialNotifications', label: 'Social Notifications', icon: 'people-outline' },
              { key: 'mealReminders', label: 'Meal Reminders', icon: 'restaurant-outline' },
              { key: 'motivationalQuotes', label: 'Motivational Quotes', icon: 'happy-outline' },
            ].map(notification => (
              <View key={notification.key} style={styles.notificationRow}>
                <View style={styles.notificationInfo}>
                  <Ionicons name={notification.icon as any} size={20} color="#666" />
                  <Text style={styles.notificationLabel}>{notification.label}</Text>
                </View>
                <Switch
                  value={personalization.notificationPreferences[notification.key as keyof typeof personalization.notificationPreferences]}
                  onValueChange={() => handleNotificationToggle(notification.key as any)}
                  trackColor={{ false: '#E0E0E0', true: '#6C63FF80' }}
                  thumbColor={
                    personalization.notificationPreferences[notification.key as keyof typeof personalization.notificationPreferences]
                      ? '#6C63FF'
                      : '#F4F3F4'
                  }
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginRight: 15,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  skipButton: {
    marginLeft: 15,
  },
  skipText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  genderButtonSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  genderText: {
    fontSize: 14,
    color: '#666',
  },
  genderTextSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  dateInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    width: '31%',
  },
  timeCardSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  timeLabelSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  timeRange: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dietaryChip: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dietaryChipSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC410',
  },
  dietaryText: {
    fontSize: 14,
    color: '#666',
  },
  dietaryTextSelected: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  notificationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationLabel: {
    fontSize: 15,
    color: '#333',
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
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PersonalizationScreen;