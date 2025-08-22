import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { ariaService } from '../../services/ai/openai';
import { AriaMessage, MessageAction } from '../../types/ai';
import WorkoutCard from '../../components/aria/WorkoutCard';
import MealCard from '../../components/aria/MealCard';
import ChartCard from '../../components/aria/ChartCard';
import FormAnalysisCard from '../../components/aria/FormAnalysisCard';
import QuickActionButton from '../../components/aria/QuickActionButton';
import MessageBubble from '../../components/aria/MessageBubble';
import TypingIndicator from '../../components/aria/TypingIndicator';

const { width: screenWidth } = Dimensions.get('window');

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  message: string;
}

const AriaChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeChat();
    setupVoiceRecognition();
    loadQuickActions();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const initializeChat = async () => {
    if (!user) return;
    
    // Load conversation history
    await ariaService.loadConversationHistory(user.id);
    
    // Send welcome message
    const welcomeMessage: IMessage = {
      _id: Math.random().toString(),
      text: `Hey ${user.name || 'there'}! 💪 I'm ARIA, your AI fitness coach. How can I help you crush your goals today?`,
      createdAt: new Date(),
      user: {
        _id: 'aria',
        name: 'ARIA',
        avatar: require('../../assets/aria-avatar.png'),
      },
    };
    
    setMessages([welcomeMessage]);
  };

  const setupVoiceRecognition = () => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value[0]) {
        setVoiceText(e.value[0]);
        handleSend([{ text: e.value[0] }] as IMessage[]);
      }
    };
    Voice.onSpeechError = (e: any) => {
      console.error('Voice recognition error:', e);
      setIsListening(false);
    };
  };

  const loadQuickActions = () => {
    const hour = new Date().getHours();
    const actions: QuickAction[] = [];
    
    if (hour >= 5 && hour <= 10) {
      actions.push(
        { id: '1', label: "Plan today's workout", icon: 'fitness', message: "Help me plan today's workout" },
        { id: '2', label: 'Breakfast ideas', icon: 'restaurant', message: 'What should I eat for breakfast?' }
      );
    } else if (hour >= 11 && hour <= 14) {
      actions.push(
        { id: '3', label: 'Lunch suggestions', icon: 'restaurant', message: 'Suggest a healthy lunch' },
        { id: '4', label: 'Midday energy', icon: 'flash', message: 'I need an energy boost' }
      );
    } else if (hour >= 15 && hour <= 19) {
      actions.push(
        { id: '5', label: 'Pre-workout meal', icon: 'nutrition', message: 'What should I eat before my workout?' },
        { id: '6', label: "Today's training", icon: 'barbell', message: "What's my workout for today?" }
      );
    } else {
      actions.push(
        { id: '7', label: 'Recovery tips', icon: 'bed', message: 'How can I optimize recovery?' },
        { id: '8', label: "Tomorrow's plan", icon: 'calendar', message: "What's the plan for tomorrow?" }
      );
    }
    
    // Add contextual actions
    actions.push(
      { id: '9', label: 'Form check', icon: 'videocam', message: 'I want to check my form' },
      { id: '10', label: 'Track progress', icon: 'trending-up', message: 'Show me my progress' }
    );
    
    setQuickActions(actions);
  };

  const handleSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (newMessages.length === 0) return;
    
    const userMessage = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);
    setStreamingMessage('');
    setIsStreaming(true);
    
    if (!user) return;
    
    try {
      await ariaService.chatStream(
        user.id,
        userMessage.text,
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk);
        },
        () => {
          // On complete, add the full message to chat
          const ariaResponse: IMessage = {
            _id: Math.random().toString(),
            text: streamingMessage,
            createdAt: new Date(),
            user: {
              _id: 'aria',
              name: 'ARIA',
              avatar: require('../../assets/aria-avatar.png'),
            },
          };
          
          setMessages(previousMessages => 
            GiftedChat.append(previousMessages, [ariaResponse])
          );
          setIsTyping(false);
          setIsStreaming(false);
          setStreamingMessage('');
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setIsStreaming(false);
    }
  }, [user, streamingMessage]);

  const handleQuickAction = (action: QuickAction) => {
    const message: IMessage = {
      _id: Math.random().toString(),
      text: action.message,
      createdAt: new Date(),
      user: {
        _id: user?.id || '1',
        name: user?.name || 'User',
      },
    };
    
    handleSend([message]);
  };

  const startVoiceRecognition = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Voice recognition start error:', error);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice recognition stop error:', error);
    }
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;
    
    // Check if message contains special content
    if (currentMessage.workout) {
      return <WorkoutCard workout={currentMessage.workout} onStart={() => {}} />;
    }
    
    if (currentMessage.meal) {
      return <MealCard meal={currentMessage.meal} onLog={() => {}} />;
    }
    
    if (currentMessage.chart) {
      return <ChartCard data={currentMessage.chart} />;
    }
    
    if (currentMessage.formAnalysis) {
      return <FormAnalysisCard analysis={currentMessage.formAnalysis} />;
    }
    
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          },
          right: {
            backgroundColor: '#007AFF',
          },
        }}
        textStyle={{
          left: {
            color: '#000',
          },
          right: {
            color: '#fff',
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <View style={styles.inputContainer}>
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbar}
          renderSend={(sendProps) => (
            <View style={styles.sendContainer}>
              <TouchableOpacity
                onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
                style={styles.voiceButton}
              >
                <Icon 
                  name={isListening ? 'mic' : 'mic-outline'} 
                  size={24} 
                  color={isListening ? '#FF0000' : '#007AFF'} 
                />
              </TouchableOpacity>
              <Send {...sendProps}>
                <View style={styles.sendButton}>
                  <Icon name="send" size={24} color="#007AFF" />
                </View>
              </Send>
            </View>
          )}
        />
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickActionsContainer}
      >
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            label={action.label}
            icon={action.icon}
            onPress={() => handleQuickAction(action)}
          />
        ))}
      </ScrollView>
    );
  };

  const renderStreamingMessage = () => {
    if (!isStreaming || !streamingMessage) return null;
    
    return (
      <View style={styles.streamingContainer}>
        <View style={styles.streamingBubble}>
          <Text style={styles.streamingText}>{streamingMessage}</Text>
          <ActivityIndicator size="small" color="#007AFF" style={styles.streamingIndicator} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/aria-logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>ARIA</Text>
          <Text style={styles.headerSubtitle}>Your AI Fitness Coach</Text>
        </View>
      </LinearGradient>
      
      <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
        {renderQuickActions()}
        
        <GiftedChat
          messages={messages}
          onSend={handleSend}
          user={{
            _id: user?.id || '1',
            name: user?.name || 'User',
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          isTyping={isTyping}
          showUserAvatar
          scrollToBottom
          renderFooter={renderStreamingMessage}
          messagesContainerStyle={styles.messagesContainer}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chatContainer: {
    flex: 1,
  },
  quickActionsContainer: {
    maxHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  messagesContainer: {
    paddingBottom: 10,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputToolbar: {
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  sendButton: {
    marginHorizontal: 10,
    padding: 5,
  },
  streamingContainer: {
    padding: 10,
  },
  streamingBubble: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  streamingIndicator: {
    marginLeft: 10,
  },
});

export default AriaChatScreen;