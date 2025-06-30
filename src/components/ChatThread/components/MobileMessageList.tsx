
import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

type Message = { 
  id: string; 
  role: "assistant" | "user"; 
  text: string; 
  isStreaming?: boolean 
};

interface MobileMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MobileMessageList: React.FC<MobileMessageListProps> = ({ 
  messages, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages.length, isLoading]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      style={{ 
        // Ensure content can scroll above the input area
        paddingBottom: '120px',
        scrollBehavior: 'smooth'
      }}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-white/60 text-sm">
            Ask me anything about your training, recovery, or performance data.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Loading indicator */}
      {isLoading && !messages.some(m => m.isStreaming) && (
        <div className="flex justify-start">
          <div className="bg-[#1E1E26] rounded-2xl p-4 max-w-[80%]">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
