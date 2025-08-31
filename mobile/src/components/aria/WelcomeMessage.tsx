import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeMessageProps {
  onSuggestionPress: (suggestion: string) => void;
}

const WELCOME_SUGGESTIONS = [
  "How can I improve my fitness?",
  "What should I eat today?",
  "Am I overtraining?",
  "Show me a workout plan",
  "How can I recover better?",
  "What's my progress like?",
];

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onSuggestionPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="fitness" size={48} color="#0057FF" />
      </View>
      
      <Text style={styles.title}>Welcome to ARIA</Text>
      <Text style={styles.subtitle}>
        Your AI fitness coach is here to help you achieve your goals. 
        Ask me anything about training, nutrition, or recovery.
      </Text>
      
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        <View style={styles.suggestionsGrid}>
          {WELCOME_SUGGESTIONS.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => onSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E2E2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
    textAlign: 'center',
  },
});