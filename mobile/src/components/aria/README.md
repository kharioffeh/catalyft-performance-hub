# ARIA Chat Components

A modern, ChatGPT-inspired chat interface for React Native that provides an enhanced user experience with ARIA, the AI fitness coach.

## Components

### ChatHeader
Displays the ARIA avatar with gradient background, name, and status indicator.

**Props:**
- `title?: string` - Custom title (default: "ARIA")
- `subtitle?: string` - Custom subtitle (default: "Always here to help")
- `showStatus?: boolean` - Whether to show status indicator (default: true)

### ChatMessage
Renders individual chat messages with support for user and AI messages, plus suggestion chips.

**Props:**
- `message: ChatMessage` - The message object
- `onSuggestionPress: (suggestion: string) => void` - Callback for suggestion selection

### ChatInput
Modern input bar with attachment button, text input, and send button with gradient styling.

**Props:**
- `message: string` - Current message text
- `onMessageChange: (text: string) => void` - Message change handler
- `onSendMessage: () => void` - Send message handler
- `isLoading?: boolean` - Whether a message is being sent
- `placeholder?: string` - Input placeholder text

### TypingIndicator
Animated typing indicator with three dots that pulse in sequence.

**Props:**
- `isVisible: boolean` - Whether to show the typing indicator

### WelcomeMessage
Welcome screen displayed when there are no messages, with fitness-related suggestions and **personalized user greeting**.

**Props:**
- `onSuggestionPress: (suggestion: string) => void` - Callback for suggestion selection
- `userName?: string` - User's name for personalized welcome message

## Usage

```tsx
import { 
  ChatHeader, 
  ChatMessage, 
  ChatInput, 
  TypingIndicator, 
  WelcomeMessage 
} from '../components/aria';

// In your chat screen
<SafeAreaView style={styles.container}>
  <ChatHeader />
  
  {messages.length === 0 ? (
    <WelcomeMessage 
      onSuggestionPress={handleSuggestion}
      userName="John" // Optional: provides personalized greeting
    />
  ) : (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <ChatMessage 
          message={item} 
          onSuggestionPress={handleSuggestion}
        />
      )}
    />
  )}
  
  {isLoading && <TypingIndicator isVisible={isLoading} />}
  
  <ChatInput
    message={message}
    onMessageChange={setMessage}
    onSendMessage={handleSend}
    isLoading={isLoading}
  />
</SafeAreaView>
```

## Features

- **Modern Design**: Clean, ChatGPT-inspired interface with proper shadows and gradients
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Suggestion Chips**: Interactive suggestion buttons for better user engagement
- **Typing Indicators**: Animated indicators when AI is responding
- **Personalized Welcome**: **User's name is displayed for a personal touch**
- **Welcome Screen**: Engaging first-time user experience with fitness suggestions
- **Accessibility**: Proper touch targets and visual feedback
- **Performance**: Optimized with useCallback and proper component separation

## Personalization Features

### Welcome Message Personalization
The `WelcomeMessage` component automatically adapts based on whether a `userName` is provided:

**Without userName:**
- "Welcome to ARIA"
- "Your AI fitness coach is here to help you achieve your goals..."

**With userName:**
- "Welcome back, [Name]!"
- "Great to see you again! Your AI fitness coach is here to help you stay on track..."

This creates a more engaging and personal experience that makes users feel recognized and valued.

## Styling

The components use a consistent design system with:
- Primary blue: `#0057FF`
- Secondary blue: `#003FCC`
- Success green: `#00C853`
- Neutral grays for backgrounds and text
- Proper shadows and elevation for depth
- Rounded corners and modern spacing

## Dependencies

- `expo-linear-gradient` - For gradient backgrounds
- `@expo/vector-icons` - For icons (Ionicons)
- React Native core components

## Customization

All components can be customized through their props and styles. The design system is built to be flexible while maintaining consistency across the chat interface.

## Integration with Auth

The chat components integrate seamlessly with your existing authentication system:

```tsx
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

// Pass the user's name for personalization
<WelcomeMessage 
  onSuggestionPress={handleSuggestion}
  userName={user?.fullName}
/>
```

This automatically provides personalized greetings for authenticated users while maintaining a great experience for anonymous users.