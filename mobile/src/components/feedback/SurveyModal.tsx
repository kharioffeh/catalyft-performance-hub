import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnalyticsService from '../../services/analytics';

interface SurveyModalProps {
  visible: boolean;
  onClose: () => void;
  surveyType?: 'nps' | 'feature' | 'general';
}

const SurveyModal: React.FC<SurveyModalProps> = ({
  visible,
  onClose,
  surveyType = 'nps',
}) => {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNpsSelect = (score: number) => {
    setNpsScore(score);
    
    AnalyticsService.track('nps_score_selected', {
      score,
      category: score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter',
    });
  };

  const handleSubmit = () => {
    if (surveyType === 'nps' && npsScore === null) return;

    const surveyData = {
      type: surveyType,
      nps_score: npsScore,
      feedback: feedback.trim(),
      timestamp: new Date().toISOString(),
    };

    AnalyticsService.track('survey_submitted', surveyData);

    // TODO: Send to backend
    
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      // Reset state
      setNpsScore(null);
      setFeedback('');
      setSubmitted(false);
    }, 2000);
  };

  const renderNpsSurvey = () => (
    <>
      <Text style={styles.question}>
        How likely are you to recommend Catalyft to a friend or colleague?
      </Text>
      
      <View style={styles.npsContainer}>
        <Text style={styles.npsLabel}>Not likely</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.npsScores}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.npsButton,
                npsScore === score && styles.npsButtonSelected,
                npsScore === score && {
                  backgroundColor:
                    score <= 6 ? '#FF6B6B' : score <= 8 ? '#FFD93D' : '#4ECDC4',
                },
              ]}
              onPress={() => handleNpsSelect(score)}
            >
              <Text
                style={[
                  styles.npsButtonText,
                  npsScore === score && styles.npsButtonTextSelected,
                ]}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.npsLabel}>Very likely</Text>
      </View>

      {npsScore !== null && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>
            {npsScore <= 6
              ? 'What can we do to improve your experience?'
              : npsScore <= 8
              ? 'What would make you more likely to recommend us?'
              : 'What do you love most about Catalyft?'}
          </Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder="Your feedback helps us improve..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}
    </>
  );

  const renderFeatureSurvey = () => (
    <>
      <Text style={styles.question}>
        Which features would you like to see in Catalyft?
      </Text>
      
      <View style={styles.featureOptions}>
        {[
          'Video workout demonstrations',
          'Live coaching sessions',
          'Meal planning integration',
          'Wearable device sync',
          'Social challenges',
          'Progress photos',
        ].map((feature) => (
          <TouchableOpacity
            key={feature}
            style={styles.featureOption}
            onPress={() => setFeedback(prev => prev + (prev ? ', ' : '') + feature)}
          >
            <Text style={styles.featureText}>{feature}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.feedbackInput}
        placeholder="Other suggestions..."
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {submitted ? 'Thank You!' : 'Quick Survey'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4ECDC4" />
              <Text style={styles.successText}>
                Your feedback has been submitted successfully!
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {surveyType === 'nps' && renderNpsSurvey()}
              {surveyType === 'feature' && renderFeatureSurvey()}
              
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (surveyType === 'nps' && npsScore === null) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={surveyType === 'nps' && npsScore === null}
                >
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  npsContainer: {
    marginBottom: 20,
  },
  npsLabel: {
    fontSize: 12,
    color: '#999',
    marginVertical: 5,
  },
  npsScores: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  npsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  npsButtonSelected: {
    borderColor: 'transparent',
  },
  npsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  npsButtonTextSelected: {
    color: 'white',
  },
  feedbackSection: {
    marginTop: 20,
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  feedbackInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
  },
  featureOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  featureOption: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    marginTop: 30,
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
  successContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SurveyModal;