
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from '@/hooks/useSessionsData';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import CalendarLegend from '@/components/CalendarLegend';
import { CalendarStats } from '@/components/CalendarStats';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { GlassButton } from '@/components/Glass/GlassButton';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 md:space-y-6">
      <GlassContainer>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Training Calendar</h1>
          </div>
          {profile?.role === 'coach' && (
            <GlassButton
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
              size={isMobile ? "default" : "default"}
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </GlassButton>
          )}
        </div>
      </GlassContainer>

      {profile?.role === 'coach' && !isLoading && (
        <GlassContainer>
          <CalendarStats sessions={sessions} />
        </GlassContainer>
      )}

      <GlassContainer>
        <CalendarLegend />
      </GlassContainer>

      <GlassContainer>
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">Training Schedule</h2>
        </div>
        <div className={isMobile ? "h-[240px]" : "h-[360px]"}>
          <TrainingCalendar 
            sessions={sessions} 
            isLoading={isLoading}
            queryClient={queryClient}
            isMobile={isMobile}
          />
        </div>
      </GlassContainer>

      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        queryClient={queryClient}
      />
    </div>
  );
};

export default Calendar;
