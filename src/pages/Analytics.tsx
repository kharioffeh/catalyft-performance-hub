import React, { useState } from 'react';
import { GlassCard } from '@/components/Glass/GlassCard';
// Keep only KPI card row and muscle heatmap/ACWR/Insights
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
          <GlassCard title="Readiness" value="88%" delta="+4.0" trend="up" />
          <GlassCard title="Sleep Duration" value="8.3h" delta="-0.1" trend="down" accent="sleep" />
          <GlassCard title="ACWR Ratio" value="0.9" delta="-0.4" trend="down" accent="load" />
          <GlassCard title="Latest Strain" value="20.6" delta="-2.1" trend="down" accent="strain" />
        </div>

        {/* Muscle HeatMap + ACWR Dial Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center min-h-[420px] sm:min-h-[460px]">
            <HeatMapBody 
              className="w-full flex items-center justify-center h-full" 
              period={period} 
              athleteId={selectedAthleteId} 
            />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ACWRDial large period={period} />
          </div>
        </div>

        {/* Aria Insights card (full-width, with stylish chips & prompt input) */}
        <div className="w-full">
          <div className="rounded-xl shadow-glass-lg bg-white/10 border border-indigo-300/20 p-6 relative overflow-visible">
            <h3 className="font-semibold mb-1 flex items-center gap-2 text-white">
              {/* icon omitted for brevity */}
              Aria Insights
            </h3>
            <div className="text-white/90 text-sm mb-3">
              {/* Placeholder: Insert insights list here hooked to API/chat output if needed, or ARIAInsight */}
              {/* <ARIAInsight metric="overview" period={parseInt(period.replace(/\D/g, ''))} /> */}
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
            <form className="mt-1 flex items-center gap-3" onSubmit={sendInsight}>
              <input
                className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm placeholder:text-white/40
                   focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ask Aria… e.g. “summarise recovery status”"
                value={ariaInput}
                onChange={e => setAriaInput(e.target.value)}
              />
              <button
                className="shrink-0 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white"
                type="submit"
                disabled={!ariaInput.trim()}
              >Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
