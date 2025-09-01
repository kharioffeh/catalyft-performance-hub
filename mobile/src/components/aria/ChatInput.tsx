import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  isLoading = false,
  placeholder = "Ask me anything..."
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage();
    }
  };

  const isMessageValid = message.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.inputContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.inputBar, isFocused && styles.inputBarFocused]}>
        <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
          <Ionicons name="attach" size={20} color="#9E9E9E" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          value={message}
          onChangeText={onMessageChange}
          multiline
          editable={!isLoading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical="center"
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !isMessageValid && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!isMessageValid || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isMessageValid ? ['#0057FF', '#003FCC'] : ['#E0E0E0', '#E0E0E0']}
            style={styles.sendButtonGradient}
          >
            {isLoading ? (
              <View style={styles.loadingIndicator}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, styles.loadingDot2]} />
                <View style={[styles.loadingDot, styles.loadingDot3]} />
              </View>
            ) : (
              <Ionicons 
                name="send" 
                size={18} 
                color={isMessageValid ? "white" : "#9E9E9E"} 
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputBarFocused: {
    borderColor: '#0057FF',
    shadowColor: '#0057FF',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2E2E2E',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginHorizontal: 1,
    opacity: 0.8,
  },
  loadingDot2: {
    backgroundColor: '#9E9E9E',
  },
  loadingDot3: {
    backgroundColor: '#9E9E9E',
  },
});