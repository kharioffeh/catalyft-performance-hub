
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from '@/hooks/useSessionsData';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import CalendarLegend from '@/components/CalendarLegend';
import { CalendarStats } from '@/components/CalendarStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Training Calendar</h1>
        </div>
        {profile?.role === 'coach' && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 min-h-[44px] active:opacity-80 w-full sm:w-auto"
            size={isMobile ? "default" : "default"}
          >
            <Plus className="w-4 h-4" />
            Schedule Session
          </Button>
        )}
      </div>

      {profile?.role === 'coach' && !isLoading && (
        <CalendarStats sessions={sessions} />
      )}

      <CalendarLegend />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Training Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className={isMobile ? "h-[240px]" : "h-[360px]"}>
            <TrainingCalendar 
              sessions={sessions} 
              isLoading={isLoading}
              queryClient={queryClient}
              isMobile={isMobile}
            />
          </div>
        </CardContent>
      </Card>

      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        queryClient={queryClient}
      />
    </div>
  );
};

export default Calendar;
