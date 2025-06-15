
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";

/* ───────────────────────────────────────────────────────────
   tiny helper hook for Vanta NET background
─────────────────────────────────────────────────────────────*/
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
      color: 0x5e6ad2, // accent
      points: 8.0,
      maxDistance: 25.0,
      spacing: 20.0,
    });

    return () => {
      vantaRef.current?.destroy?.();
    };
  }, [ref]);
}

/* ───────────────────────────────────────────────────────────
   Component
─────────────────────────────────────────────────────────────*/
export default function Chat() {
  const navigate = useNavigate();
  const bgRef = useRef<HTMLDivElement>(null);
  useVantaBackground(bgRef);

  const [prompt, setPrompt] = useState("");

  const SUGGESTIONS = [
    {
      title: "Draft a business proposal",
      desc: "Create a compelling proposal with all required sections.",
    },
    {
      title: "Analyze market trends",
      desc: "Identify current market trends and opportunities.",
    },
    {
      title: "Debug code",
      desc: "Share code, I'll help identify and fix issues.",
    },
    {
      title: "Create a content calendar",
      desc: "Plan your content strategy with a publishing schedule.",
    },
  ];

  async function handleStart() {
    if (!prompt.trim()) return;

    // In a real app, call your createThread API, then navigate:
    const fakeId = crypto.randomUUID();
    navigate(`/aria/${fakeId}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark text-white">
      {/* background layers */}
      <div ref={bgRef} className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none" />

      {/* header */}
      <header className="flex items-center px-6 py-4 border-b border-subtle">
        <h1 className="text-lg font-medium">New Chat</h1>
      </header>

      {/* main */}
      <main className="p-6 max-w-4xl mx-auto">
        {/* intro */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">
            How can I help you today?
          </h2>
          <p className="text-gray-400">
            Ask anything or choose a suggested prompt.
          </p>
        </div>

        {/* suggestions */}
        <section className="mb-12">
          <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">
            Suggested Prompts
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => setPrompt(s.title)}
                className="bg-[#1E1E26] border border-subtle hover:border-accent rounded-xl p-4 text-left transition-colors"
              >
                <h4 className="font-medium mb-1">{s.title}</h4>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* input */}
        <div className="bg-[#1E1E26] border border-subtle rounded-lg p-5">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-transparent outline-none resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleStart}
              className="bg-accent hover:bg-opacity-90 px-5 py-2 rounded-md"
            >
              Start Chat
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
