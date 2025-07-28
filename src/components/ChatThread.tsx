import React, { useState, useEffect } from "react";
import { useChatState } from "./ChatThread/hooks/useChatState";
import { useChatStream } from "@/hooks/useChatStream";
import { ChatBackground } from "./ChatThread/components/ChatBackground";
import { ChatMessage } from "./ChatThread/components/ChatMessage";
import { LoadingIndicator } from "./ChatThread/components/LoadingIndicator";
import { ChatInput } from "./ChatThread/components/ChatInput";
import { MobileChatLayout } from "./ChatThread/components/MobileChatLayout";
import { MobileMessageList } from "./ChatThread/components/MobileMessageList";
import { MobileChatInput } from "./ChatThread/components/MobileChatInput";
import { SuggestedPrompts } from "./ChatThread/components/SuggestedPrompts";
import { PatchPrompt } from "@/features/chat/PatchPrompt";
import { ProgramPatch } from "@/types/programPatch";
import { useIsMobile } from "@/hooks/useBreakpoint";

const SUGGESTED_PROMPTS = [
  "How can I improve my personal training?",
  "What does my personal data suggest?",
  "Am I personally overtraining?",
  "Should I rest today based on my data?",
  "Analyze my personal performance trends"
];

export const ChatThread = React.memo(() => {
  const {
    messages,
    draft,
    setDraft,
    isLoading,
    actualThreadId,
    sendMessage
  } = useChatState();
  
  const { onAriaMessage } = useChatStream();
  const [activePatch, setActivePatch] = useState<{ id: string; patch: ProgramPatch } | null>(null);
  const isMobile = useIsMobile();

  // Listen for ARIA program patch events
  useEffect(() => {
    const unsubscribe = onAriaMessage((event) => {
      if (event.type === 'aria' && event.data.kind === 'programPatch' && event.data.payload && event.data.id) {
        setActivePatch({
          id: event.data.id,
          patch: event.data.payload
        });
      }
    });

    return unsubscribe;
  }, [onAriaMessage]);

  // Mobile layout
  if (isMobile) {
    return (
      <MobileChatLayout threadId={actualThreadId}>
        {/* Message list */}
        <MobileMessageList 
          messages={messages} 
          isLoading={isLoading}
        />

        {/* Suggested prompts - show when no messages */}
        {messages.length === 0 && (
          <SuggestedPrompts
            prompts={SUGGESTED_PROMPTS}
            onSelectPrompt={setDraft}
            isVisible={messages.length === 0}
          />
        )}

        {/* Mobile input */}
        <MobileChatInput
          draft={draft}
          setDraft={setDraft}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
      </MobileChatLayout>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="relative min-h-screen bg-brand-charcoal text-white overflow-hidden">
      {/* Background Effects */}
      <ChatBackground />
      
      {/* Responsive container for chat */}
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-subtle px-4 md:px-8 flex items-center bg-[#12121A]/80 backdrop-blur-lg sticky top-0 z-10">
          <span className="text-sm opacity-80 truncate">
            Thread ID • {actualThreadId || 'New Chat'}
          </span>
        </header>
        
        {/* Main chat area */}
        <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 md:px-0">
          <div className="w-full max-w-2xl flex-1 flex flex-col justify-between mx-auto py-6">
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Loading indicator only shows when waiting for stream to start */}
              {isLoading && !messages.some(m => m.isStreaming) && <LoadingIndicator />}
            </div>
            
            {/* Footer/send area */}
            <footer className="mt-6">
              <ChatInput
                draft={draft}
                setDraft={setDraft}
                isLoading={isLoading}
                onSendMessage={() => sendMessage()}
              />
            </footer>
          </div>
        </main>
      </div>

      {/* Program Patch Prompt */}
      {activePatch && (
        <PatchPrompt
          patch={activePatch.patch}
          isVisible={!!activePatch}
          onAccept={() => setActivePatch(null)}
          onDecline={() => setActivePatch(null)}
        />
      )}
    </div>
  );
});
