
import React from 'react';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  user_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  user?: {
    name: string;
  };
}

interface SessionChipProps {
  session: Session;
  onClick?: () => void;
}

export const SessionChip: React.FC<SessionChipProps> = ({ session, onClick }) => {
  const getGradientColors = (type: string) => {
    switch (type) {
      case 'strength':
        return 'from-green-500 to-green-600';
      case 'technical':
        return 'from-blue-500 to-blue-600';
      case 'recovery':
        return 'from-pink-500 to-pink-600';
      case 'conditioning':
        return 'from-orange-500 to-orange-600';
      case 'assessment':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const gradientClasses = getGradientColors(session.type);

  return (
    <div 
      className={cn(
        "relative rounded-full p-0.5 mb-3 cursor-pointer transition-all duration-200",
        "bg-gradient-to-r", 
        gradientClasses,
        "hover:scale-[1.02] active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-full px-4 py-3 min-h-[44px] flex items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <span>{formatTime(session.start_ts)}</span>
            <span className="text-gray-400">•</span>
            <span className="capitalize">{session.type}</span>
          </div>
          {session.notes && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {session.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
