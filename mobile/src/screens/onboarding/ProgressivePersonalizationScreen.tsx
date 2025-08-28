import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ABTestingService from '../../services/abTesting';
import EnhancedAnalyticsService from '../../services/analytics.enhanced';

interface ProgressiveField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  icon?: string;
  category: 'essential' | 'recommended' | 'optional';
}

const PROGRESSIVE_FIELDS: ProgressiveField[] = [
  // Essential fields (shown first)
  {
    id: 'fitness_level',
    label: "What's your fitness level?",
    type: 'select',
    required: true,
    category: 'essential',
    icon: 'fitness-outline',
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
  },
  {
    id: 'workout_frequency',
    label: 'How often can you work out?',
    type: 'select',
    required: true,
    category: 'essential',
    icon: 'calendar-outline',
    options: [
      { value: '2', label: '2 days/week' },
      { value: '3', label: '3 days/week' },
      { value: '4', label: '4 days/week' },
      { value: '5', label: '5+ days/week' },
    ],
  },
  
  // Recommended fields (shown after essential)
  {
    id: 'age',
    label: 'Your age',
    type: 'number',
    required: false,
    category: 'recommended',
    placeholder: 'Enter your age',
    icon: 'person-outline',
  },
  {
    id: 'weight',
    label: 'Current weight (kg)',
    type: 'number',
    required: false,
    category: 'recommended',
    placeholder: 'Enter weight',
    icon: 'scale-outline',
  },
  
  // Optional fields (shown last or skippable)
  {
    id: 'height',
    label: 'Height (cm)',
    type: 'number',
    required: false,
    category: 'optional',
    placeholder: 'Enter height',
    icon: 'resize-outline',
  },
  {
    id: 'dietary_preferences',
    label: 'Dietary preferences',
    type: 'multiselect',
    required: false,
    category: 'optional',
    icon: 'restaurant-outline',
    options: [
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'keto', label: 'Keto' },
      { value: 'paleo', label: 'Paleo' },
    ],
  },
];

const ProgressivePersonalizationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { goals, assessment } = route.params || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [visibleFields, setVisibleFields] = useState<ProgressiveField[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  const shouldUseProgressive = ABTestingService.shouldUseProgressiveDisclosure();
  const requiredFields = ABTestingService.getRequiredFields();

  useEffect(() => {
    initializeFields();
    animateFieldEntry();
  }, [currentStep]);

  const initializeFields = () => {
    if (!shouldUseProgressive) {
      // Show all fields at once (control variant)
      setVisibleFields(PROGRESSIVE_FIELDS);
    } else {
      // Progressive disclosure - show fields based on category and step
      const fieldsToShow = getFieldsForStep(currentStep);
      setVisibleFields(fieldsToShow);
    }
  };

  const getFieldsForStep = (step: number): ProgressiveField[] => {
    switch (step) {
      case 0:
        return PROGRESSIVE_FIELDS.filter(f => f.category === 'essential');
      case 1:
        return PROGRESSIVE_FIELDS.filter(f => 
          f.category === 'essential' || f.category === 'recommended'
        );
      case 2:
        return PROGRESSIVE_FIELDS;
      default:
        return PROGRESSIVE_FIELDS;
    }
  };

  const animateFieldEntry = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Track field completion
    EnhancedAnalyticsService.track('onboarding_field_completed', {
      field_id: fieldId,
      field_category: PROGRESSIVE_FIELDS.find(f => f.id === fieldId)?.category,
      step: currentStep,
      progressive_disclosure: shouldUseProgressive,
    });
  };

  const handleContinue = () => {
    // Validate required fields
    const requiredFieldIds = visibleFields
      .filter(f => f.required)
      .map(f => f.id);
    
    const missingFields = requiredFieldIds.filter(id => !formData[id]);
    
    if (missingFields.length > 0) {
      // Show validation error
      return;
    }

    if (shouldUseProgressive && currentStep < 2) {
      // Show next set of fields
      setCurrentStep(currentStep + 1);
      
      EnhancedAnalyticsService.track('progressive_disclosure_step', {
        step: currentStep + 1,
        fields_shown: getFieldsForStep(currentStep + 1).length,
      });
    } else {
      // Complete personalization
      completePersonalization();
    }
  };

  const handleSkipOptional = () => {
    // Track skip action
    EnhancedAnalyticsService.track('onboarding_optional_skipped', {
      skipped_fields: visibleFields
        .filter(f => f.category === 'optional' && !formData[f.id])
        .map(f => f.id),
      step: currentStep,
    });
    
    completePersonalization();
  };

  const completePersonalization = () => {
    // Track completion with field fill rate
    const filledFields = Object.keys(formData).length;
    const totalFields = PROGRESSIVE_FIELDS.length;
    const fillRate = (filledFields / totalFields) * 100;
    
    EnhancedAnalyticsService.trackFunnelStep('onboarding_personalization_completed', {
      filled_fields: filledFields,
      total_fields: totalFields,
      fill_rate: fillRate,
      progressive_disclosure: shouldUseProgressive,
      form_data: formData,
    });
    
    navigation.navigate('PlanSelection', {
      goals,
      assessment,
      personalization: formData,
    });
  };

  const renderField = (field: ProgressiveField) => {
    const value = formData[field.id];
    
    return (
      <Animated.View
        key={field.id}
        style={[
          styles.fieldContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.fieldHeader}>
          {field.icon && (
            <Ionicons name={field.icon as any} size={20} color="#6C63FF" />
          )}
          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
        
        {field.type === 'select' && (
          <View style={styles.selectContainer}>
            {field.options?.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  value === option.value && styles.selectOptionSelected,
                ]}
                onPress={() => handleFieldChange(field.id, option.value)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    value === option.value && styles.selectOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {field.type === 'multiselect' && (
          <View style={styles.multiSelectContainer}>
            {field.options?.map(option => {
              const selected = Array.isArray(value) && value.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.multiSelectOption,
                    selected && styles.multiSelectOptionSelected,
                  ]}
                  onPress={() => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = selected
                      ? currentValues.filter(v => v !== option.value)
                      : [...currentValues, option.value];
                    handleFieldChange(field.id, newValues);
                  }}
                >
                  <Text
                    style={[
                      styles.multiSelectOptionText,
                      selected && styles.multiSelectOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        
        {(field.type === 'text' || field.type === 'number') && (
          <TextInput
            style={styles.textInput}
            placeholder={field.placeholder}
            value={value?.toString() || ''}
            onChangeText={(text) => handleFieldChange(field.id, text)}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
          />
        )}
      </Animated.View>
    );
  };

  const hasOptionalFields = visibleFields.some(f => f.category === 'optional');
  const progress = shouldUseProgressive 
    ? ((currentStep + 1) / 3) * 100 
    : (Object.keys(formData).length / PROGRESSIVE_FIELDS.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            {shouldUseProgressive && currentStep === 0
              ? "Let's start with the basics"
              : shouldUseProgressive && currentStep === 1
              ? 'A bit more about you'
              : 'Complete your profile'}
          </Text>
          
          <Text style={styles.subtitle}>
            {shouldUseProgressive
              ? `Step ${currentStep + 1} of 3 - ${
                  currentStep === 0
                    ? 'Essential information'
                    : currentStep === 1
                    ? 'Recommended details'
                    : 'Optional preferences'
                }`
              : 'Fill in as much as you like'}
          </Text>

          <View style={styles.fieldsContainer}>
            {visibleFields.map(renderField)}
          </View>

          {shouldUseProgressive && currentStep > 0 && (
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => setCurrentStep(2)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
              <Text style={styles.addMoreText}>Add more details</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, ABTestingService.getButtonColor() && {
              backgroundColor: ABTestingService.getButtonColor(),
            }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {shouldUseProgressive && currentStep < 2 ? 'Next' : 'Continue'}
            </Text>
          </TouchableOpacity>
          
          {hasOptionalFields && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipOptional}
            >
              <Text style={styles.skipText}>Skip optional fields</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 15,
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
  },
  fieldsContainer: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#FF6B6B',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectOptionSelected: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF10',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectOptionTextSelected: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  multiSelectOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  multiSelectOptionSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC410',
  },
  multiSelectOptionText: {
    fontSize: 14,
    color: '#666',
  },
  multiSelectOptionTextSelected: {
    color: '#4ECDC4',
    fontWeight: '600',
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
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  addMoreText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '500',
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
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
});

export default ProgressivePersonalizationScreen;