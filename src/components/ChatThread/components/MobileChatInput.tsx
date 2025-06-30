
import React, { useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";

interface MobileChatInputProps {
  draft: string;
  setDraft: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
}

export const MobileChatInput: React.FC<MobileChatInputProps> = ({
  draft,
  setDraft,
  isLoading,
  onSendMessage
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    if (draft.trim() && !isLoading) {
      onSendMessage();
    }
  }, [draft, isLoading, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 120); // Max 4 lines
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    adjustTextareaHeight();
  }, [setDraft, adjustTextareaHeight]);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-30
        bg-[#1E1E26]/95 backdrop-blur-lg border-t border-subtle
        transition-all duration-300 ease-out
        ${isFocused ? 'pb-2' : 'pb-4'}
      `}
      style={{ 
        paddingBottom: isFocused ? 'env(safe-area-inset-bottom, 8px)' : 'max(env(safe-area-inset-bottom, 16px), 16px)'
      }}
    >
      <div className="px-4 pt-3">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleInput}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message…"
              disabled={isLoading}
              rows={1}
              className="
                w-full bg-[#2A2A35] text-white placeholder:text-white/50
                border border-white/10 rounded-2xl px-4 py-3
                resize-none outline-none text-base leading-relaxed
                focus:border-accent/50 focus:ring-2 focus:ring-accent/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!draft.trim() || isLoading}
            className="
              w-12 h-12 bg-accent hover:bg-accent/90 active:bg-accent/80
              disabled:bg-white/10 disabled:text-white/30
              rounded-full flex items-center justify-center
              transition-all duration-200 touch-manipulation
              disabled:cursor-not-allowed flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-accent/50
            "
            aria-label={isLoading ? 'Sending...' : 'Send message'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
