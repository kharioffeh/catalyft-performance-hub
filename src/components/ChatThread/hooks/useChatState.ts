
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ariaStream, getAriaMessages, type AriaChatMessage, type AriaMessage } from "@/lib/aria";

type Msg = { id: string; role: "assistant" | "user"; text: string; isStreaming?: boolean };

export function useChatState() {
  const { threadId } = useParams<{ threadId?: string }>();
  const location = useLocation();
  const locationState = location.state as { initialQuestion?: string } | null;
  
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actualThreadId, setActualThreadId] = useState<string | undefined>(threadId);

  // Load existing messages when thread ID changes
  useEffect(() => {
    async function loadThreadMessages() {
      if (threadId) {
        try {
          const ariaMessages = await getAriaMessages(threadId);
          const formattedMessages: Msg[] = ariaMessages
            .filter((msg: AriaMessage) => msg.role !== 'system')
            .map((msg: AriaMessage) => ({
              id: msg.id.toString(),
              role: msg.role as "assistant" | "user",
              text: msg.content
            }));
          setMessages(formattedMessages);
          setActualThreadId(threadId);
        } catch (error) {
          console.error('Error loading thread messages:', error);
          // If we can't load the thread, start fresh
          setMessages([
            { id: "welcome", role: "assistant", text: "Hi 👋 — what can I do for you?" },
          ]);
        }
      } else {
        // No thread ID - start with welcome message
        setMessages([
          { id: "welcome", role: "assistant", text: "Hi 👋 — what can I do for you?" },
        ]);
      }
    }

    loadThreadMessages();
  }, [threadId]);

  // Handle initial question from navigation state
  useEffect(() => {
    if (locationState?.initialQuestion && !threadId) {
      // Start a new conversation with the initial question
      sendMessage(locationState.initialQuestion);
    }
  }, [locationState?.initialQuestion, threadId]);

  async function sendMessage(messageText?: string) {
    const messageToSend = messageText || draft.trim();
    if (!messageToSend || isLoading) return;

    const userMsg: Msg = { 
      id: crypto.randomUUID(), 
      role: "user", 
      text: messageToSend 
    };
    
    setMessages((m) => [...m, userMsg]);
    if (!messageText) setDraft("");
    setIsLoading(true);

    // Add streaming assistant message placeholder
    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: Msg = {
      id: assistantMsgId,
      role: "assistant",
      text: "",
      isStreaming: true
    };
    setMessages((m) => [...m, assistantMsg]);

    try {
      // Prepare messages for ARIA
      const conversationHistory: AriaChatMessage[] = [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.text
        })),
        {
          role: 'user' as const,
          content: messageToSend
        }
      ];

      // Call ARIA with streaming
      const response = await ariaStream(
        conversationHistory, 
        actualThreadId,
        (token: string) => {
          // Update the streaming message with each token
          setMessages((currentMessages) => 
            currentMessages.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, text: msg.text + token }
                : msg
            )
          );
        }
      );

      // Update thread ID if this was a new conversation
      if (response.thread_id && !actualThreadId) {
        setActualThreadId(response.thread_id);
        // Update the URL without navigation to reflect the new thread
        window.history.replaceState({}, '', `/chat/${response.thread_id}`);
      }

      // Mark streaming as complete
      setMessages((currentMessages) => 
        currentMessages.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Replace streaming message with error
      setMessages((currentMessages) => 
        currentMessages.map(msg => 
          msg.id === assistantMsgId 
            ? { 
                ...msg, 
                text: "I'm sorry, I encountered an error. Please try again.",
                isStreaming: false
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    draft,
    setDraft,
    isLoading,
    actualThreadId,
    sendMessage
  };
}
