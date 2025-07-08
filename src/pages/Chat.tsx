import React from "react";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ChatStart } from "../components/ChatStart";
import { ChatThread } from "../components/ChatThread";

// Error fallback component
const ChatErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-dark text-white">
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong with the chat</h2>
      <p className="text-white/70">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-md"
      >
        Try again
      </button>
    </div>
  </div>
);

export function Chat() {
  const { threadId } = useParams<{ threadId?: string }>();

  return (
    <ErrorBoundary FallbackComponent={ChatErrorFallback}>
      {!threadId ? <ChatStart /> : <ChatThread />}
    </ErrorBoundary>
  );
}

export default Chat;
