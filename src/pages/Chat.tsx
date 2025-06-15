import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

type Msg = { id: string; role: "assistant" | "user"; text: string };

// Hook for animated background
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

export default function Chat() {
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bgRef = useRef<HTMLDivElement>(null);
  useVantaBackground(bgRef);

  // Suggested questions for data insights
  const suggestedQuestions = [
    "How has my sleep improved this week?",
    "What is my training load trend?",
    "Am I at risk of overtraining?",
    "Which day was my best recovery?",
    "How does my strain compare to last month?",
    "Can you summarize my recent performance metrics?",
    "Which habit should I focus on to improve readiness?",
    "Any patterns in my sleep or HRV?",
    "How have my active minutes changed over time?",
    "Peak training times or insights?",
  ];

  if (!threadId) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Fill textarea with a suggested question
    const handleSuggestedClick = (q: string) => setDraft(q);

    const handleStartThread = () => {
      if (!draft.trim()) {
        setError("Please enter your question to start chatting.");
        return;
      }
      setError(null);
      const newThreadId = crypto.randomUUID();
      navigate(`/chat/${newThreadId}`, {
        state: { initialQuestion: draft.trim() },
      });
    };

    return (
      <div className="relative min-h-screen flex items-center justify-center bg-dark text-white">
        <div ref={bgRef} className="absolute inset-0 -z-10" />
        <div className="bg-[#23233A]/90 rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto animate-fade-in">
          <h1 className="text-2xl font-semibold mb-2 text-center">
            AI Performance Coach
          </h1>
          <p className="mb-4 text-center opacity-75">
            Get data-driven insights or ask your own question below.
          </p>
          <div className="mb-4">
            <div className="mb-1 text-sm text-gray-300 text-center">
              Try one of these:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="bg-accent/20 hover:bg-accent/40 text-accent px-3 py-1 rounded-full text-xs transition-colors duration-200"
                  type="button"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question to start..."
            className="w-full bg-[#161622] rounded-md border border-accent/10 px-4 py-3 text-base outline-none mb-2 resize-none"
          />
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <button
            onClick={handleStartThread}
            className="w-full bg-accent hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  // If on /chat/:threadId, show chat UI
  // Try to get the initial user question from location.state
  // Otherwise show welcome message
  // We want to only initialize this once with useState's initializer
  const locationState = location.state as { initialQuestion?: string } | null;
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (locationState?.initialQuestion) {
      return [
        { id: "user-initial", role: "user", text: locationState.initialQuestion },
        {
          id: "welcome",
          role: "assistant",
          text: "Hi 👋 — what can I do for you?",
        },
      ];
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        text: "Hi 👋 — what can I do for you?",
      },
    ];
  });
  const [draft, setDraft] = useState("");

  async function sendMessage() {
    if (!draft.trim()) return;

    // optimistic UI
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: draft.trim() };
    setMessages((m) => [...m, userMsg]);
    setDraft("");

    /* TODO: stream assistant reply */
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

      {/* sidebar stub */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-[#15151B] border-r border-subtle hidden lg:block">
        {/* TODO: fill with threads & tools */}
      </aside>

      {/* main column */}
      <section className="lg:ml-64 flex flex-col h-screen">
        {/* top-bar */}
        <header className="h-16 border-b border-subtle px-6 flex items-center">
          <span className="text-sm opacity-80 truncate">
            Thread ID • {threadId}
          </span>
        </header>

        {/* chat area */}
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

        {/* input bar */}
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
