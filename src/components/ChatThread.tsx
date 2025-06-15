
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
    <div className="relative min-h-screen bg-dark text-white overflow-hidden">
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none -z-10" />
      {/* Responsive container for chat */}
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-subtle px-4 md:px-8 flex items-center bg-[#12121A]/80 backdrop-blur-lg sticky top-0 z-10">
          <span className="text-sm opacity-80 truncate">Thread ID • {threadId}</span>
        </header>
        {/* Main chat area */}
        <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 md:px-0">
          <div className="w-full max-w-2xl flex-1 flex flex-col justify-between mx-auto py-6">
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
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
                    className={`max-w-[75%] rounded-lg p-4 text-base break-words ${
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
            {/* Footer/send area */}
            <footer className="mt-6">
              <div className="bg-[#1E1E26]/90 border border-subtle rounded-lg p-3 shadow focus-within:ring-2 ring-accent transition">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message…"
                  className="w-full bg-transparent outline-none resize-none text-white placeholder:text-muted-foreground text-base"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={sendMessage}
                    className="bg-accent hover:bg-opacity-90 px-4 py-2 rounded-md min-w-[88px] text-white font-semibold shadow-sm transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
