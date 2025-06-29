import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { AthleteSelector } from '@/components/Analytics/AthleteSelector';
import { Download } from 'lucide-react';

const ariaSuggestions = [
  "readiness summary",
  "sleep insights",
  "next-week watch-outs",
];

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [ariaInput, setAriaInput] = useState('');
  
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
          <GlassCard className="p-5">
            <p className="text-xs mb-1 tracking-wide text-white/70 uppercase font-medium">Readiness</p>
            <p className="text-2xl font-semibold text-white mb-1">88%</p>
            <p className="text-xs flex items-center gap-1 font-medium text-emerald-400">
              <span>+4.0 vs 7d</span>
            </p>
          </GlassCard>
          <GlassCard accent="sleep" className="p-5">
            <p className="text-xs mb-1 tracking-wide text-white/70 uppercase font-medium">Sleep Duration</p>
            <p className="text-2xl font-semibold text-white mb-1">8.3h</p>
            <p className="text-xs flex items-center gap-1 font-medium text-rose-400">
              <span>-0.1 vs 7d</span>
            </p>
          </GlassCard>
          <GlassCard accent="load" className="p-5">
            <p className="text-xs mb-1 tracking-wide text-white/70 uppercase font-medium">ACWR Ratio</p>
            <p className="text-2xl font-semibold text-white mb-1">0.9</p>
            <p className="text-xs flex items-center gap-1 font-medium text-rose-400">
              <span>-0.4 vs 7d</span>
            </p>
          </GlassCard>
          <GlassCard accent="strain" className="p-5">
            <p className="text-xs mb-1 tracking-wide text-white/70 uppercase font-medium">Latest Strain</p>
            <p className="text-2xl font-semibold text-white mb-1">20.6</p>
            <p className="text-xs flex items-center gap-1 font-medium text-rose-400">
              <span>-2.1 vs 7d</span>
            </p>
          </GlassCard>
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

        {/* Aria Insights card */}
        <GlassCard accent="secondary" className="p-6">
          <h3 className="font-semibold mb-1 flex items-center gap-2 text-white">
            Aria Insights
          </h3>
          <div className="text-white/90 text-sm mb-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Sleep was slightly reduced last 3 days. Pay attention to recovery.</li>
              <li>Load ratio is within optimal range. No overtraining detected.</li>
              <li>Readiness increased 4% vs last week.</li>
            </ul>
          </div>
          {/* Chips */}
          <div className="flex gap-2 mb-2">
            {ariaSuggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                className="bg-white/10 text-white/80 rounded-full px-3 py-1 text-xs font-medium hover:bg-indigo-500/40 transition"
                onClick={() => setAriaInput(s)}
              >{s}</button>
            ))}
          </div>
          {/* Prompt bar */}
          <form className="mt-1 flex items-center gap-3" onSubmit={(e) => { e.preventDefault(); setAriaInput(''); }}>
            <input
              className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm placeholder:text-white/40
                 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Ask Aria… e.g. "summarise recovery status""
              value={ariaInput}
              onChange={e => setAriaInput(e.target.value)}
            />
            <button
              className="shrink-0 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white"
              type="submit"
              disabled={!ariaInput.trim()}
            >Send</button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
