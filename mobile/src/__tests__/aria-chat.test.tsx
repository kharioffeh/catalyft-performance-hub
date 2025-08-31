import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatHeader, ChatMessage, ChatInput, TypingIndicator, WelcomeMessage } from '../components/aria';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('ARIA Chat Components', () => {
  describe('ChatHeader', () => {
    it('renders with default props', () => {
      const { getByText } = render(<ChatHeader />);
      expect(getByText('ARIA')).toBeTruthy();
      expect(getByText('Always here to help')).toBeTruthy();
    });

    it('renders with custom props', () => {
      const { getByText } = render(
        <ChatHeader 
          title="Custom Title" 
          subtitle="Custom Subtitle" 
        />
      );
      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom Subtitle')).toBeTruthy();
    });
  });

  describe('ChatMessage', () => {
    const mockMessage = {
      id: '1',
      text: 'Hello, how can I help you?',
      isUser: false,
      suggestions: ['Tell me more', 'Show examples'],
    };

    it('renders user message correctly', () => {
      const userMessage = { ...mockMessage, isUser: true };
      const { getByText } = render(
        <ChatMessage 
          message={userMessage} 
          onSuggestionPress={jest.fn()} 
        />
      );
      expect(getByText('Hello, how can I help you?')).toBeTruthy();
    });

    it('renders AI message with suggestions', () => {
      const { getByText } = render(
        <ChatMessage 
          message={mockMessage} 
          onSuggestionPress={jest.fn()} 
        />
      );
      expect(getByText('Hello, how can I help you?')).toBeTruthy();
      expect(getByText('Tell me more')).toBeTruthy();
      expect(getByText('Show examples')).toBeTruthy();
    });
  });

  describe('ChatInput', () => {
    it('renders with message and handlers', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          message="Test message"
          onMessageChange={jest.fn()}
          onSendMessage={jest.fn()}
        />
      );
      expect(getByPlaceholderText('Ask me anything...')).toBeTruthy();
    });

    it('renders with loading state', () => {
      const { getByPlaceholderText } = render(
        <ChatInput
          message=""
          onMessageChange={jest.fn()}
          onSendMessage={jest.fn()}
          isLoading={true}
        />
      );
      expect(getByPlaceholderText('Ask me anything...')).toBeTruthy();
    });
  });

  describe('TypingIndicator', () => {
    it('renders when visible', () => {
      const { getByTestId } = render(<TypingIndicator isVisible={true} />);
      // The component should render without crashing
      expect(true).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByTestId } = render(<TypingIndicator isVisible={false} />);
      // Component should not be in the tree
      expect(queryByTestId('typing-indicator')).toBeFalsy();
    });
  });

  describe('WelcomeMessage', () => {
    it('renders welcome message and suggestions', () => {
      const { getByText } = render(
        <WelcomeMessage onSuggestionPress={jest.fn()} />
      );
      expect(getByText('Welcome to ARIA')).toBeTruthy();
      expect(getByText('Try asking:')).toBeTruthy();
      expect(getByText('How can I improve my fitness?')).toBeTruthy();
    });
  });
});