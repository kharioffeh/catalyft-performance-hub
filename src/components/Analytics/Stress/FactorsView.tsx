import React from 'react';
import { GlassCard } from '@/components/ui';
import { StressData } from '@/hooks/useStress';
import { Progress } from '@/components/ui/progress';

interface FactorsViewProps {
  data: StressData | undefined;
  period: number;
  isLoading: boolean;
}

export const FactorsView: React.FC<FactorsViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
          <div className="h-32 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Mock stress factors for demonstration
  const stressFactors = [
    { name: 'Sleep Quality', impact: 85, description: 'Poor sleep significantly increases stress' },
    { name: 'Training Load', impact: 72, description: 'High training intensity affects stress levels' },
    { name: 'Work Pressure', impact: 68, description: 'Professional demands contribute to stress' },
    { name: 'Recovery Time', impact: 45, description: 'Adequate recovery helps manage stress' },
    { name: 'Nutrition', impact: 38, description: 'Balanced diet supports stress management' },
    { name: 'Social Support', impact: 25, description: 'Strong relationships reduce stress impact' }
  ];

  const getImpactColor = (impact: number) => {
    if (impact <= 30) return 'text-green-400';
    if (impact <= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactLevel = (impact: number) => {
    if (impact <= 30) return 'Low';
    if (impact <= 60) return 'Moderate';
    return 'High';
  };

  return (
    <div className="space-y-6">
      {/* Stress Level Overview */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Stress Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-white">{data.current}</div>
            <div className="text-white/60 text-sm">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-white">{data.average7d}</div>
            <div className="text-white/60 text-sm">7-Day Average</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-display font-bold ${
              data.level === 'low' ? 'text-green-400' :
              data.level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {data.level.toUpperCase()}
            </div>
            <div className="text-white/60 text-sm">Stress Category</div>
          </div>
        </div>
      </GlassCard>

      {/* Stress Contributing Factors */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contributing Factors</h3>
        <p className="text-white/70 text-sm mb-6">
          Factors that may be influencing your current stress levels
        </p>
        
        <div className="space-y-4">
          {stressFactors.map((factor, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">{factor.name}</h4>
                <span className={`font-bold ${getImpactColor(factor.impact)}`}>
                  {getImpactLevel(factor.impact)} Impact
                </span>
              </div>
              
              <div className="mb-2">
                <Progress 
                  value={factor.impact} 
                  className="h-2"
                />
              </div>
              
              <p className="text-white/60 text-sm">{factor.description}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Stress Management Strategies */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personalized Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">Immediate Actions</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/20 rounded-lg border-l-4 border-blue-400">
                <div className="font-medium text-blue-300">Deep Breathing</div>
                <div className="text-white/70 text-sm">5-minute breathing exercise</div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg border-l-4 border-green-400">
                <div className="font-medium text-green-300">Light Movement</div>
                <div className="text-white/70 text-sm">10-minute walk or gentle stretching</div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg border-l-4 border-purple-400">
                <div className="font-medium text-purple-300">Mindfulness</div>
                <div className="text-white/70 text-sm">Brief meditation or grounding exercise</div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">Long-term Strategies</h4>
            <div className="space-y-3">
              <div className="p-3 bg-orange-500/20 rounded-lg border-l-4 border-orange-400">
                <div className="font-medium text-orange-300">Sleep Optimization</div>
                <div className="text-white/70 text-sm">Improve sleep quality and duration</div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg border-l-4 border-cyan-400">
                <div className="font-medium text-cyan-300">Training Adjustment</div>
                <div className="text-white/70 text-sm">Balance intensity with recovery</div>
              </div>
              <div className="p-3 bg-pink-500/20 rounded-lg border-l-4 border-pink-400">
                <div className="font-medium text-pink-300">Stress Monitoring</div>
                <div className="text-white/70 text-sm">Track patterns and triggers</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};