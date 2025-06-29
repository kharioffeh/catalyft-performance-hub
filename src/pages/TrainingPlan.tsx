
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainingWeeks } from '@/hooks/useTrainingWeeks';
import GlassCalendar from '@/components/training-plan/GlassCalendar';
import { useAthleteType } from '@/hooks/useAthleteType';
import { GlassSkeletonCard } from '@/components/ui/GlassSkeleton';

const TrainingPlan: React.FC = () => {
  const { profile } = useAuth();
  const { data: athleteTypeData, isLoading: isLoadingAthleteType } = useAthleteType(profile?.id, profile?.role);
  
  // For solo athletes, use their own ID; for coaches, this would need athlete selection
  const athleteId = athleteTypeData?.type === 'solo' ? profile?.id : undefined;
  const weeks = useTrainingWeeks(athleteId);

  if (isLoadingAthleteType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Training Plan</h1>
            <p className="text-white/70">Your personalized training schedule</p>
          </div>
          
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 md:gap-3">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <GlassSkeletonCard key={j} className="h-24" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Training Plan</h1>
          <p className="text-white/70">Your personalized training schedule</p>
        </div>

        {/* Calendar */}
        <GlassCalendar weeks={weeks} />
      </div>
    </div>
  );
};

export default TrainingPlan;
