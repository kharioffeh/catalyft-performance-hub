import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui';
import { Progress } from '@/components/ui/progress';

interface ReadinessData {
  readiness_score: number;
  hrv_rmssd: number;
  sleep_min: number;
  soreness_score: number;
  jump_cm: number;
}

interface SubBarProps {
  label: string;
  icon: string;
  value: number;
  unit: string;
  maxValue: number;
}

const SubBar: React.FC<SubBarProps> = ({ label, icon, value, unit, maxValue }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold">
          {value} {unit}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-blue rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const ReadinessCard: React.FC = () => {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        setLoading(true);
        const { data: response, error } = await supabase.functions.invoke('getReadiness');
        
        if (error) {
          throw error;
        }
        
        setData(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching readiness data:', err);
        setError('Failed to load readiness data');
      } finally {
        setLoading(false);
      }
    };

    fetchReadiness();
  }, []);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-white/10 rounded"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-2 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6">
        <div className="text-center space-y-4">
          <div className="text-5xl font-display font-bold text-muted-foreground">--</div>
          <p className="text-sm text-muted-foreground">
            {error || 'No readiness data available'}
          </p>
        </div>
      </GlassCard>
    );
  }

  const subBars = [
    {
      label: 'HRV',
      icon: '💓',
      value: data.hrv_rmssd,
      unit: 'ms',
      maxValue: 100
    },
    {
      label: 'Sleep',
      icon: '😴',
      value: Math.round(data.sleep_min / 60 * 10) / 10, // Convert to hours with 1 decimal
      unit: 'hr',
      maxValue: 10
    },
    {
      label: 'Soreness',
      icon: '🔥',
      value: data.soreness_score,
      unit: '/10',
      maxValue: 10
    },
    {
      label: 'Jump',
      icon: '🚀',
      value: data.jump_cm,
      unit: 'cm',
      maxValue: 100
    }
  ];

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Main Readiness Score */}
        <div className="text-center">
          <div className="text-5xl font-display font-bold text-brand-blue">
            {data.readiness_score}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Today's Readiness
          </p>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          {subBars.map((bar, index) => (
            <SubBar
              key={index}
              label={bar.label}
              icon={bar.icon}
              value={bar.value}
              unit={bar.unit}
              maxValue={bar.maxValue}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};