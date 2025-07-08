import React from 'react';
import { useSleep } from '@/hooks/useSleep';
import { SleepScoreCard } from '@/components/sleep/SleepScoreCard';
import { Hypnogram } from '@/components/sleep/Hypnogram';

export default function Sleep() {
  const { 
    getLastNightSleep, 
    getSleepScore, 
    getAverageSleepHours,
    isLoading 
  } = useSleep();

  const lastNightSleep = getLastNightSleep();
  const sleepScore = getSleepScore();
  const avgSleepHours = getAverageSleepHours();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Sleep Analysis</h1>
          <p className="text-white/70">
            Track your sleep quality and understand your nightly patterns
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sleep Score Card */}
          <SleepScoreCard
            score={sleepScore}
            previousScore={lastNightSleep ? 85 : 0} // Mock previous score
            sleepHours={lastNightSleep?.totalSleepHours || avgSleepHours}
            efficiency={lastNightSleep?.sleepEfficiency || 85}
            className="lg:col-span-1"
          />

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Average Sleep */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {avgSleepHours}<span className="text-lg text-white/60">h</span>
                </div>
                <div className="text-sm text-white/70">7-Day Average</div>
                <div className="text-xs text-white/50 mt-1">
                  Target: 7-9 hours
                </div>
              </div>
            </div>

            {/* Sleep Consistency */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {lastNightSleep?.sleepEfficiency || 85}<span className="text-lg text-white/60">%</span>
                </div>
                <div className="text-sm text-white/70">Sleep Efficiency</div>
                <div className="text-xs text-white/50 mt-1">
                  Target: &gt;85%
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {lastNightSleep?.heartRate.avg || 58}<span className="text-lg text-white/60">bpm</span>
                </div>
                <div className="text-sm text-white/70">Avg Heart Rate</div>
                <div className="text-xs text-white/50 mt-1">
                  Range: {lastNightSleep?.heartRate.min || 45}-{lastNightSleep?.heartRate.max || 75} bpm
                </div>
              </div>
            </div>

            {/* Sleep Time */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {lastNightSleep?.bedtime || '22:30'}
                </div>
                <div className="text-sm text-white/70">Bedtime</div>
                <div className="text-xs text-white/50 mt-1">
                  Wake: {lastNightSleep?.wakeTime || '07:00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hypnogram */}
        {lastNightSleep && (
          <Hypnogram 
            stages={lastNightSleep.stages}
            className="animate-fade-in"
          />
        )}

        {/* No Data State */}
        {!lastNightSleep && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🌙</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Sleep Data</h3>
            <p className="text-white/60">
              Connect a wearable device to start tracking your sleep patterns
            </p>
          </div>
        )}
      </div>
    </div>
  );
}