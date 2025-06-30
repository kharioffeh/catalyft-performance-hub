
import React from "react";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatBackground } from "./ChatBackground";

interface MobileChatLayoutProps {
  children: React.ReactNode;
  threadId?: string;
}

export const MobileChatLayout: React.FC<MobileChatLayoutProps> = ({ 
  children, 
  threadId 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-dark text-white flex flex-col overflow-hidden">
      {/* Background Effects */}
      <ChatBackground />
      
      {/* Mobile Header */}
      <header className="relative z-20 h-14 bg-[#12121A]/90 backdrop-blur-lg border-b border-subtle px-4 flex items-center">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Back to chat list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="ml-2 flex-1 min-w-0">
          <h1 className="text-sm font-medium truncate">
            {threadId ? `Thread • ${threadId.slice(0, 8)}...` : 'New Chat'}
          </h1>
          <p className="text-xs text-white/60">ARIA Assistant</p>
        </div>
      </header>

      {/* Chat Content */}
      <div className="relative flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};
