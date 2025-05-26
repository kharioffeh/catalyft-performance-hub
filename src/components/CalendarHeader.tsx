
import React from 'react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  userName: string;
  onSignOut: () => Promise<void>;
}

const CalendarHeader = ({ userName, onSignOut }: CalendarHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Training Calendar</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {userName}
            </span>
            <Button variant="outline" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;
