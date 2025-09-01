import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { ChatHeader, ChatMessage, ChatInput, TypingIndicator, WelcomeMessage } from '../../components/aria';
import { ariaService } from '../../services/ai/openai';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  suggestions?: string[];
}

export const AriaChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || message.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await ariaService.chat(messageText);
      
      // Generate suggestions based on the response
      const suggestions = generateSuggestions(response || '');
      
      const ariaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response || '',
        isUser: false,
        suggestions,
      };

      setMessages(prev => [...prev, ariaMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [message]);

  const generateSuggestions = (response: string): string[] => {
    // Generate contextual suggestions based on the response
    const suggestions = [
      'Tell me more about that',
      'How can I improve?',
      'What should I do next?',
      'Can you explain further?',
      'Show me examples',
      'What are the benefits?',
    ];
    
    // Randomly select 2-3 suggestions
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2));
  };

  const handleSuggestionPress = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
    <ChatMessage 
      message={item} 
      onSuggestionPress={handleSuggestionPress}
    />
  ), [handleSuggestionPress]);

  const handleSendMessage = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  const renderContent = () => {
    if (messages.length === 0) {
      return (
        <WelcomeMessage 
          onSuggestionPress={handleSuggestionPress}
          userName={user?.email || 'User'}
        />
      );
    }

    return (
      <>
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        {isLoading && <TypingIndicator isVisible={isLoading} />}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean header */}
      <ChatHeader />

      {/* Content area */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Modern input bar */}
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
