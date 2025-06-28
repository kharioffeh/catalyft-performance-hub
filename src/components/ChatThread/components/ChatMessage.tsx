
import React from "react";

type Msg = { id: string; role: "assistant" | "user"; text: string; isStreaming?: boolean };

interface ChatMessageProps {
  message: Msg;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : ""}`}>
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-lg p-4 text-base break-words ${
          message.role === "assistant"
            ? "bg-[#1E1E26]"
            : "bg-accent bg-opacity-20"
        }`}
      >
        {message.text}
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
        )}
      </div>
      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-[#2A2A35] flex-shrink-0 flex items-center justify-center ml-3">
          U
        </div>
      )}
    </div>
  );
};
