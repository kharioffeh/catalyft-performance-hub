
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

function useVantaBackground(ref: React.RefObject<HTMLDivElement>) {
  const vantaRef = React.useRef<any>(null);
  React.useEffect(() => {
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

export const ChatStart = React.memo(() => {
  const navigate = useNavigate();
  const bgRef = useRef<HTMLDivElement>(null);
  useVantaBackground(bgRef);

  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const suggestedQuestions = [
    {
      title: "How has my sleep improved this week?",
      description: "Analyze my personal sleep data and highlight improvements.",
    },
    {
      title: "What is my training load trend?",
      description: "Review how my recent training load compares to previous weeks.",
    },
    {
      title: "Am I at risk of overtraining?",
      description: "Assess my personal overreaching or injury risk from recent sessions.",
    },
    {
      title: "Which day was my best recovery?",
      description: "Find my optimal personal readiness score this week.",
    },
    {
      title: "How does my strain compare to last month?",
      description: "Break down my personal workout strain over time.",
    },
    {
      title: "Can you summarize my recent performance metrics?",
      description: "Provide a personalized summary of my training metrics.",
    },
    {
      title: "Which habit should I focus on to improve readiness?",
      description: "Analyze my personal habits affecting sleep & recovery.",
    },
    {
      title: "Any patterns in my sleep or HRV?",
      description: "Look for correlations in my personal sleep and HRV trends.",
    },
  ];

  const recentTopics = [
    "Training load",
    "Sleep efficiency",
    "Performance trend",
    "HRV patterns",
  ];

  const handleSuggestionClick = (q: string) => setDraft(q);

  const handleStartThread = () => {
    if (!draft.trim()) {
      setError("Please enter your question to start chatting.");
      return;
    }
    setError(null);
    // Navigate to new chat without thread ID - ChatThread will handle creating the thread
    navigate(`/chat/new`, {
      state: { initialQuestion: draft.trim() },
      replace: false,
    });
  };

  return (
    <div className="relative min-h-screen bg-brand-charcoal text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div ref={bgRef} className="absolute inset-0 z-0" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 md:px-6 py-4 flex items-center border-b border-subtle">
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

      {/* Main Content Area */}
      <main className="relative z-10 max-w-3xl mx-auto pt-8 pb-8 px-4 md:px-0 w-full">
        {/* Welcome Section */}
        <div className="text-center mb-12 select-none">
          <svg className="w-16 h-16 mx-auto mb-4 stroke-white opacity-90" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl font-bold mb-2 font-sans">How can I help you today?</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get personalized coaching insights and analyze your training data with ARIA.
          </p>
        </div>

        {/* Suggested Prompts */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 text-left tracking-wide">
            Suggested Prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestedQuestions.map((q) => (
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
                  <h3 className="font-medium mb-1 text-white font-sans">{q.title}</h3>
                  <p className="text-sm text-muted-foreground">{q.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">Recent Topics</h2>
          <div className="flex flex-wrap gap-3">
            {recentTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleSuggestionClick(topic)}
                className="bg-[#1E1E26] border border-subtle rounded-full px-4 py-2 text-sm hover:border-accent transition-colors text-white font-sans"
                type="button"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Section (disabled for now) */}
        <div className="mb-12 opacity-80" aria-disabled>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase mb-4 tracking-wide">Upload Files</h2>
          <div className="border-2 border-dashed border-subtle rounded-xl p-8 text-center">
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

        {/* Chat Input */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <div className="bg-[#232337] border border-subtle rounded-lg p-3 flex flex-col gap-2">
              <textarea
                className="w-full bg-transparent outline-none resize-none text-white placeholder:text-muted-foreground text-base font-sans"
                placeholder="Type your message or '/command'..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartThread();
                  }
                }}
              />
              {error && <div className="text-red-400 text-xs mb-1">{error}</div>}
              <div className="flex justify-between items-center mt-1">
                <div className="flex space-x-2">
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
      </main>
    </div>
  );
});
