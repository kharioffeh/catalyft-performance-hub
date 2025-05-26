
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from '@/hooks/useSessionsData';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { CalendarLegend } from '@/components/CalendarLegend';
import { CalendarStats } from '@/components/CalendarStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Training Calendar</h1>
        </div>
        {profile?.role === 'coach' && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
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
          <CardTitle>Training Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingCalendar 
            sessions={sessions} 
            isLoading={isLoading}
            queryClient={queryClient}
          />
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
