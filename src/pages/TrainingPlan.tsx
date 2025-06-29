
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainingWeeks } from '@/hooks/useTrainingWeeks';
import GlassCalendar from '@/components/training-plan/GlassCalendar';
import { useAthleteType } from '@/hooks/useAthleteType';

const TrainingPlan: React.FC = () => {
  const { profile } = useAuth();
  const { data: athleteTypeData, isLoading: isLoadingAthleteType } = useAthleteType(profile?.id, profile?.role);
  
  // For solo athletes, use their own ID; for coaches, this would need athlete selection
  const athleteId = athleteTypeData?.type === 'solo' ? profile?.id : undefined;
  const weeks = useTrainingWeeks(athleteId);

  if (isLoadingAthleteType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
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
