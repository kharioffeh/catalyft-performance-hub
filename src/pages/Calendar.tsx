
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useSessionsData } from '@/hooks/useSessionsData';
import CalendarHeader from '@/components/CalendarHeader';
import CalendarLegend from '@/components/CalendarLegend';
import TrainingCalendar from '@/components/TrainingCalendar';

const Calendar = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarHeader 
        userName={profile?.full_name || user.email} 
        onSignOut={signOut} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CalendarLegend />
          <TrainingCalendar 
            sessions={sessions}
            isLoading={isLoading}
            queryClient={queryClient}
          />
        </div>
      </main>
    </div>
  );
};

export default Calendar;
