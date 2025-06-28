
import React from "react";

interface ChatInputProps {
  draft: string;
  setDraft: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  draft,
  setDraft,
  isLoading,
  onSendMessage
}) => {
  return (
    <div className="bg-[#1E1E26]/90 border border-subtle rounded-lg p-3 shadow focus-within:ring-2 ring-accent transition">
      <textarea
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your message…"
        className="w-full bg-transparent outline-none resize-none text-white placeholder:text-muted-foreground text-base"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={onSendMessage}
          disabled={isLoading || !draft.trim()}
          className="bg-accent hover:bg-opacity-90 px-4 py-2 rounded-md min-w-[88px] text-white font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
