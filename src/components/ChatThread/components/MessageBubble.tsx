
import React, { useState, useCallback } from "react";
import { useGlassToast } from "@/hooks/useGlassToast";

type Message = { 
  id: string; 
  role: "assistant" | "user"; 
  text: string; 
  isStreaming?: boolean 
};

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [isPressed, setIsPressed] = useState(false);
  const toast = useGlassToast();
  const isUser = message.role === "user";

  const handleLongPress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success("Copied to clipboard", "Message text copied successfully");
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Copy failed", "Unable to copy message to clipboard");
    }
  }, [message.text, toast]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    // Long press detection (800ms)
    const timer = setTimeout(() => {
      handleLongPress();
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 800);

    const cleanup = () => {
      clearTimeout(timer);
      setIsPressed(false);
    };

    const handleTouchEnd = () => cleanup();
    const handleTouchCancel = () => cleanup();

    document.addEventListener('touchend', handleTouchEnd, { once: true });
    document.addEventListener('touchcancel', handleTouchCancel, { once: true });
  }, [handleLongPress]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className="flex items-end space-x-2 max-w-[85%]">
        {/* Assistant avatar */}
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center mb-1">
            <span className="text-xs font-medium">AI</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            rounded-2xl px-4 py-3 relative transition-all duration-200
            ${isUser 
              ? "bg-accent text-white rounded-br-md" 
              : "bg-[#1E1E26] text-white rounded-bl-md"
            }
            ${isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
            touch-manipulation select-text
          `}
          onTouchStart={handleTouchStart}
          onMouseDown={handleTouchStart}
          style={{ 
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
          
          {/* Streaming indicator */}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-white/60 ml-1 animate-pulse" />
          )}
        </div>

        {/* User avatar */}
        {isUser && (
          <div className="w-7 h-7 rounded-full bg-[#2A2A35] flex-shrink-0 flex items-center justify-center mb-1">
            <span className="text-xs font-medium">U</span>
          </div>
        )}
      </div>
    </div>
  );
};
