
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";

type Msg = { id: string; role: "assistant" | "user"; text: string };

function useVantaBackground(ref: React.RefObject<HTMLDivElement>) {
  const vantaRef = useRef<any>(null);
  useEffect(() => {
    if (!ref.current) return;
    vantaRef.current = NET({
      el: ref.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      backgroundColor: 0x101014,
      color: 0x5e6ad2,
      points: 8,
      maxDistance: 25,
      spacing: 20,
    });
    return () => vantaRef.current?.destroy?.();
  }, [ref]);
}

export function ChatThread() {
  const { threadId } = useParams<{ threadId?: string }>();
  const location = useLocation();
  const bgRef = useRef<HTMLDivElement>(null);
  useVantaBackground(bgRef);

  const locationState = location.state as { initialQuestion?: string } | null;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (locationState?.initialQuestion) {
      setMessages([
        { id: "user-initial", role: "user", text: locationState.initialQuestion },
        { id: "welcome", role: "assistant", text: "Hi 👋 — what can I do for you?" },
      ]);
    } else {
      setMessages([
        { id: "welcome", role: "assistant", text: "Hi 👋 — what can I do for you?" },
      ]);
    }
    setDraft("");
    // Only on thread load
    // eslint-disable-next-line
  }, [threadId]);

  async function sendMessage() {
    if (!draft.trim()) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: draft.trim() };
    setMessages((m) => [...m, userMsg]);
    setDraft("");

    // TODO: use AI backend; placeholder for now:
    const assistantMsg: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Pretend this is streamed content from Aria…",
    };
    setMessages((m) => [...m, assistantMsg]);
  }

  return (
    <div className="relative min-h-screen bg-dark text-white">
      <div ref={bgRef} className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none" />
      <section className="flex flex-col h-screen">
        <header className="h-16 border-b border-subtle px-6 flex items-center">
          <span className="text-sm opacity-80 truncate">Thread ID • {threadId}</span>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3">
                  AI
                </div>
              )}
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  m.role === "assistant"
                    ? "bg-[#1E1E26]"
                    : "bg-accent bg-opacity-20"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#2A2A35] flex-shrink-0 flex items-center justify-center ml-3">
                  U
                </div>
              )}
            </div>
          ))}
        </div>
        <footer className="h-32 border-t border-subtle px-6 py-4">
          <div className="bg-[#1E1E26] border border-subtle rounded-lg p-3">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              className="w-full bg-transparent outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={sendMessage}
                className="bg-accent hover:bg-opacity-90 px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
