import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
    suggestions?: string[];
  };
  onSuggestionPress: (suggestion: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionPress }) => {
  if (message.isUser) {
    return (
      <View style={styles.userMessageContainer}>
        <View style={styles.userMessage}>
          <Text style={styles.userMessageText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.ariaMessageContainer}>
      <View style={styles.ariaMessage}>
        <Text style={styles.messageText}>{message.text}</Text>
        {message.suggestions && message.suggestions.length > 0 && (
          <ScrollView 
            horizontal 
            style={styles.suggestions} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {message.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => onSuggestionPress(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  ariaMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userMessage: {
    maxWidth: '85%',
    backgroundColor: '#0057FF',
    borderRadius: 18,
    padding: 16,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ariaMessage: {
    maxWidth: '85%',
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2E2E2E',
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  suggestions: {
    marginTop: 12,
  },
  suggestionsContent: {
    paddingRight: 8,
  },
  suggestionChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
});