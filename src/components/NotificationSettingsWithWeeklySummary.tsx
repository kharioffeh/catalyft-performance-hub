
import React from 'react';
import { WeeklySummarySettings } from '@/components/WeeklySummarySettings';

interface NotificationSettingsWithWeeklySummaryProps {
  children: React.ReactNode;
}

export const NotificationSettingsWithWeeklySummary: React.FC<NotificationSettingsWithWeeklySummaryProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
      
      {/* Weekly Summary Settings */}
      <WeeklySummarySettings />
    </div>
  );
};
