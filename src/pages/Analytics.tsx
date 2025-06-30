
import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { KpiCard } from '@/components/ui/KpiCard';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { AthleteSelector } from '@/components/Analytics/AthleteSelector';
import { Download, Sparkles, Activity, Moon, Zap, Target } from 'lucide-react';

const ARIA_SUGGESTIONS = [
  "How can I improve recovery this week?",
  "Summarise today's readiness drivers.",
  "Which muscle groups are at highest risk?",
  "Suggest mobility drills before tomorrow's session.",
  "Detect any over-training trends in last 14 days.",
  "What factors are impacting sleep quality?",
  "Recommend training load adjustments.",
  "Analyze performance patterns this month."
] as const;

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [ariaInput, setAriaInput] = useState('');
  
  const handleChipClick = (suggestion: string) => {
    setAriaInput(suggestion);
    // Focus the textarea after state update
    setTimeout(() => {
      document.getElementById('aria-input')?.focus();
    }, 0);
  };
  
  // Placeholder send handler (integrate with POST /api/aria/insights logic)
  const sendInsight = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/aria/insights
    setAriaInput('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Analytics</h1>
          <p className="text-white/70">Comprehensive performance insights and data trends</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <AthleteSelector 
            selectedAthleteId={selectedAthleteId}
            onAthleteChange={setSelectedAthleteId}
          />
          <button className="flex items-center gap-2 text-xs px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-white">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white/10 backdrop-blur rounded-xl p-1">
            {(["24h", "7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <KpiCard
            title="Readiness"
            value="88%"
            icon={Activity}
            delta={{ value: "+4.0 vs 7d", positive: true }}
          />
          <KpiCard
            title="Sleep Duration"
            value="8.3h"
            icon={Moon}
            delta={{ value: "-0.1 vs 7d", positive: false }}
          />
          <KpiCard
            title="ACWR Ratio"
            value="0.9"
            icon={Target}
            delta={{ value: "-0.4 vs 7d", positive: false }}
          />
          <KpiCard
            title="Latest Strain"
            value="20.6"
            icon={Zap}
            delta={{ value: "-2.1 vs 7d", positive: false }}
          />
        </div>

        {/* Muscle HeatMap + ACWR Dial Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Muscle HeatMap - takes up 2/3 of the width on larger screens */}
          <div className="lg:col-span-2">
            <HeatMapBody 
              className="w-full h-[380px] sm:h-[420px]" 
              period={period} 
              athleteId={selectedAthleteId} 
            />
          </div>
          
          {/* ACWR Dial - takes up 1/3 of the width on larger screens */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[280px]">
              <ACWRDial large period={period} />
            </div>
          </div>
        </div>

        {/* Enhanced Aria Insights card */}
        <GlassCard accent="secondary" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
              ARIA Insights
            </h3>
          </div>

          <div className="text-white/90 text-sm mb-4">
            <ul className="list-disc list-inside space-y-1">
              <li>Sleep was slightly reduced last 3 days. Pay attention to recovery.</li>
              <li>Load ratio is within optimal range. No overtraining detected.</li>
              <li>Readiness increased 4% vs last week.</li>
            </ul>
          </div>

          {/* Smart Prompt Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ARIA_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 rounded-full border border-white/15 transition-colors text-white/80"
                onClick={() => handleChipClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Enhanced Input - Textarea */}
          <form className="flex flex-col gap-3" onSubmit={sendInsight}>
            <textarea
              id="aria-input"
              rows={3}
              className="w-full resize-none rounded-lg bg-black/20 p-3 text-sm placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
              placeholder="Ask ARIA… e.g. 'How can I improve recovery this week?'"
              value={ariaInput}
              onChange={(e) => setAriaInput(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white flex items-center gap-2"
                type="submit"
                disabled={!ariaInput.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
