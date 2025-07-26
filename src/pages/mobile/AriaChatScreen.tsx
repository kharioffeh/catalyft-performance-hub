import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ariaStream } from '@/lib/aria/streaming';
import { useInsights } from '@/hooks/useInsights';
import type { AriaChatMessage } from '@/lib/aria/types';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const SUGGESTED_PROMPTS = [
  "How should I adjust my training based on my current readiness?",
  "What does my sleep data suggest about my recovery?",
  "How can I improve my training load balance?",
  "What recovery strategies do you recommend?"
];

export const AriaChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const insights = useInsights();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm ARIA, your AI coaching assistant. I can help you analyze your training data, suggest recovery strategies, and optimize your performance. What would you like to know?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate suggested prompts based on insights
  const getContextualPrompts = () => {
    const contextualPrompts = insights.map(insight => {
      switch (insight.type) {
        case 'readiness':
          return `My readiness is ${insight.value}%. What should I focus on today?`;
        case 'sleep':
          return `My sleep score is ${insight.value}%. How can I improve my recovery?`;
        case 'load':
          return `My training load ratio is ${insight.value?.toFixed(2)}. Is this optimal?`;
        case 'stress':
          return `My stress level is ${insight.value}%. How should this affect my training?`;
        default:
          return null;
      }
    }).filter(Boolean);

    return [...contextualPrompts, ...SUGGESTED_PROMPTS].slice(0, 4);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputText('');
    setIsStreaming(true);

    // Add streaming assistant message placeholder
    const assistantMsgId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare conversation history
      const conversationHistory: AriaChatMessage[] = [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: textToSend
        }
      ];

      // Stream response from ARIA
      const response = await ariaStream(
        conversationHistory,
        currentThreadId,
        (token: string) => {
          // Update the streaming message with each token
          setMessages(currentMessages => 
            currentMessages.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        }
      );

      // Update thread ID if this was a new conversation
      if (response.thread_id && !currentThreadId) {
        setCurrentThreadId(response.thread_id);
      }

      // Mark streaming as complete
      setMessages(currentMessages => 
        currentMessages.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Replace streaming message with error
      setMessages(currentMessages => 
        currentMessages.map(msg => 
          msg.id === assistantMsgId 
            ? { 
                ...msg, 
                content: "I'm sorry, I encountered an error. Please try again.",
                isStreaming: false
              }
            : msg
        )
      );

      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">ARIA Coach</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-brand-blue text-white ml-4'
                  : 'bg-white/10 text-white border border-white/20 mr-4'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              {message.isStreaming && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-150" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {!isStreaming && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {getContextualPrompts().map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-2 text-xs bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white/80 hover:text-white transition-all"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/20">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask ARIA about your training..."
            className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
            disabled={isStreaming}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isStreaming}
            className="p-2 rounded-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};