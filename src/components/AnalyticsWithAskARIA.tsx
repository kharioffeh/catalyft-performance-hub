
import React from 'react';
import { AskARIA } from '@/components/AskARIA';

interface AnalyticsWithAskARIAProps {
  children: React.ReactNode;
}

export const AnalyticsWithAskARIA: React.FC<AnalyticsWithAskARIAProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {/* Ask ARIA Button - positioned at the top right */}
      <div className="flex justify-end">
        <AskARIA context="analytics" />
      </div>
      
      {children}
    </div>
  );
};
