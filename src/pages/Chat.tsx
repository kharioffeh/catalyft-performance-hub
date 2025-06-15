import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";

// App color classes and font are already set via Tailwind config and index.css

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
    {
      title: "How has my sleep improved this week?",
      description: "Summarize my sleep data, highlight improvements and regressions.",
    },
    {
      title: "What is my training load trend?",
      description: "Tell me how my recent load compares to previous weeks.",
    },
    {
      title: "Am I at risk of overtraining?",
      description: "Spot any overreaching or injury risk from my sessions.",
    },
    {
      title: "Which day was my best recovery?",
      description: "Find my optimal readiness score this week.",
    },
    {
      title: "How does my strain compare to last month?",
      description: "Break down my workout strain over time.",
    },
    {
      title: "Can you summarize my recent performance metrics?",
      description: "Provide a readable summary from the main metrics.",
    },
    {
      title: "Which habit should I focus on to improve readiness?",
      description: "Analyze habits affecting my sleep & recovery.",
    },
    {
      title: "Any patterns in my sleep or HRV?",
      description: "Look for correlations in sleep and HRV trends.",
    },
  ];

  const recentTopics = [
    "Training load",
    "Sleep efficiency",
    "Performance trend",
    "HRV patterns",
  ];

  if (!threadId) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Prefill draft from a suggested prompt or topic
    const handleSuggestionClick = (q: string) => setDraft(q);

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

    // Responsive margins/padding & font
    return (
      <div className="relative min-h-screen overflow-hidden bg-dark text-white font-sans">
        {/* Animated Background */}
        <div ref={bgRef} className="absolute inset-0 z-0" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 px-4 md:px-6 py-4 flex items-center border-b border-subtle shadow-sm">
          <button onClick={() => navigate(-1)} className="mr-4 touch-target text-muted-foreground hover:bg-subtle rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" aria-label="Back" />
          </button>
          <h1 className="text-lg font-medium tracking-tight">New Chat</h1>
          <div className="ml-auto flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-subtle transition-colors" aria-label="Chat options" tabIndex={0}>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-3xl mx-auto pt-8 pb-40 px-4 md:px-0 w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12 select-none">
            {/* Logo Cube - use a simple SVG */}
            <svg className="w-16 h-16 mx-auto mb-4 stroke-white opacity-90" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold mb-2">How can I help you today?</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get tailored performance insights, or select a prompt to explore your athlete data.
            </p>
          </div>

          {/* Suggested Prompts */}
          <div className="mb-12">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 text-left tracking-wide">
              Suggested Prompts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestedQuestions.map((q, idx) => (
                <div
                  key={q.title}
                  className="bg-[#1E1E26] border border-subtle rounded-xl p-4 hover:border-accent cursor-pointer transition-colors flex items-start group"
                  onClick={() => handleSuggestionClick(q.title)}
                  tabIndex={0}
                  role="button"
                  aria-label={q.title}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 text-accent opacity-80" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium mb-1 text-white">{q.title}</h3>
                    <p className="text-sm text-muted-foreground">{q.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="mb-12">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">Recent Topics</h2>
            <div className="flex flex-wrap gap-3">
              {recentTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSuggestionClick(topic)}
                  className="bg-[#1E1E26] border border-subtle rounded-full px-4 py-2 text-sm hover:border-accent transition-colors text-white"
                  type="button"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Section (disabled for now) */}
          <div className="mb-12" aria-disabled>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">Upload Files</h2>
            <div className="border-2 border-dashed border-subtle rounded-xl p-8 text-center opacity-80">
              <svg className="w-12 h-12 mx-auto mb-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-muted-foreground mb-2">Drag and drop files here or</p>
              <button disabled className="bg-accent hover:bg-opacity-90 text-white py-2 px-4 rounded-md inline-flex items-center opacity-80 cursor-not-allowed">
                <span>Browse files</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, TXT, CSV (max 10MB)</p>
            </div>
          </div>
        </main>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 px-0 py-4 bg-dark border-t border-subtle z-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-[#1E1E26] border border-subtle rounded-lg p-3 flex flex-col gap-2">
              <textarea
                className="w-full bg-transparent outline-none resize-none text-white placeholder:text-muted-foreground text-base"
                placeholder="Type your message or '/command'..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
              />
              {error && <div className="text-red-400 text-xs mb-1">{error}</div>}
              <div className="flex justify-between items-center mt-1">
                <div className="flex space-x-2">
                  {/* Button placeholders, can be used for future input tools */}
                  <button disabled className="p-2 rounded hover:bg-subtle transition-colors text-muted-foreground cursor-not-allowed">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                  <button disabled className="p-2 rounded hover:bg-subtle transition-colors text-muted-foreground cursor-not-allowed">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleStartThread}
                  className="bg-accent hover:bg-opacity-90 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors font-semibold"
                >
                  <span>Start Chat</span>
                  <ArrowLeft className="w-4 h-4 -rotate-180" />
                </button>
              </div>
            </div>
          </div>
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
