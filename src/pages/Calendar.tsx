
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from '@/hooks/useSessionsData';
import { GlassButton } from '@/components/Glass/GlassButton';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import { SessionDetailsDialog } from '@/components/SessionDetailsDialog';
import { AgendaHeader } from '@/components/Calendar/AgendaHeader';
import { AgendaList } from '@/components/Calendar/AgendaList';
import { MiniDatePicker } from '@/components/Calendar/MiniDatePicker';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  athletes?: {
    name: string;
  };
}

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-glass-card-light/30 dark:bg-glass-card-dark/50 rounded-xl"></div>
          <div className="h-64 bg-glass-card-light/30 dark:bg-glass-card-dark/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with date picker */}
      <AgendaHeader
        selectedDate={selectedDate}
        onDatePickerOpen={() => setShowDatePicker(true)}
      />

      {/* Create Session Button */}
      {profile?.role === 'coach' && (
        <div className="flex justify-center">
          <GlassButton
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 min-h-[44px]"
            size={isMobile ? "default" : "default"}
          >
            <Plus className="w-4 h-4" />
            Schedule Session
          </GlassButton>
        </div>
      )}

      {/* Agenda List */}
      <AgendaList
        sessions={sessions}
        selectedDate={selectedDate}
        onSessionClick={handleSessionClick}
      />

      {/* Mini Date Picker Modal */}
      <MiniDatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Create Session Dialog */}
      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        queryClient={queryClient}
      />

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        session={selectedSession}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        queryClient={queryClient}
        canEdit={profile?.role === 'coach'}
      />
    </div>
  );
};

export default Calendar;
