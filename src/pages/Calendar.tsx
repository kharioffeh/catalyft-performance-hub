
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useUpdateSession } from '@/hooks/useSessions';
import { SessionDrawer } from '@/components/SessionDrawer';
import { Session } from '@/types/training';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { CalendarView } from '@/components/calendar/CalendarView';

// Session interface is now imported from types/training.ts

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { data: sessions = [], isLoading, refetch } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const updateSession = useUpdateSession();

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDrawerOpen(true);
  };

  return (
    <GlassLayout variant="dashboard">
      <GlassContainer className="min-h-screen">
        <CalendarView
          sessions={sessions}
          onSessionClick={handleSessionClick}
          isLoading={isLoading}
        />

        {/* Session Drawer */}
        <SessionDrawer
          session={selectedSession}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </GlassContainer>
    </GlassLayout>
  );
};

export default Calendar;
