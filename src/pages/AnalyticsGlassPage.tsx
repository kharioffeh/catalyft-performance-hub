
import React, { useState } from 'react';
import { GlassCard } from '@/components/Glass/GlassCard';
import { ReadinessLine } from '@/components/Analytics/Glass/ReadinessLine';
import { SleepStack } from '@/components/Analytics/Glass/SleepStack';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsGlassPage() {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Analytics</h1>
          <p className="text-white/70">Glassmorphism Dashboard</p>
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

        {/* Trend Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard>
            <ReadinessLine spark period={period} />
          </GlassCard>
          <GlassCard>
            <SleepStack spark period={period} />
          </GlassCard>
          <GlassCard>
            <ACWRDial mini period={period} />
          </GlassCard>
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <GlassCard className="h-72">
            <ReadinessLine period={period} />
          </GlassCard>
          <GlassCard className="h-72">
            <SleepStack period={period} />
          </GlassCard>
        </div>

        {/* Training Load Heat-map */}
        <GlassCard className="lg:h-96 flex flex-col lg:flex-row gap-6 p-8">
          <HeatMapBody period={period} className="flex-1" />
          <div className="flex-1 flex items-center justify-center">
            <ACWRDial large period={period} />
          </div>
        </GlassCard>

        {/* ARIA insight banner */}
        <GlassCard tone="flat" className="px-6 py-4 bg-indigo-400/10 backdrop-blur border border-indigo-300/20 shadow-inner">
          <h3 className="font-semibold mb-1 flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-indigo-300" />
            AI Performance Insights
          </h3>
          <div className="text-white/90">
            <ARIAInsight metric="overview" period={parseInt(period.replace(/\D/g, ''))} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
