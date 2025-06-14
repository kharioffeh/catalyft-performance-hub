
import React from 'react';
import { Clock, User, FileText } from 'lucide-react';
import clsx from 'clsx';

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

interface GlassEventRowProps {
  session: Session;
}

const GlassEventRow: React.FC<GlassEventRowProps> = ({ session }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'technical':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'recovery':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDuration = () => {
    const start = new Date(session.start_ts);
    const end = new Date(session.end_ts);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/60" />
          <span className="text-sm text-white font-medium">
            {formatTime(session.start_ts)} - {formatTime(session.end_ts)}
          </span>
          <span className="text-xs text-white/60">
            ({getDuration()})
          </span>
        </div>
        <span className={clsx(
          "px-2 py-1 rounded-full text-xs font-medium border",
          getTypeColor(session.type)
        )}>
          {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <User className="h-4 w-4 text-white/60" />
        <span className="text-sm text-white">
          {session.athletes?.name || 'Unknown Athlete'}
        </span>
      </div>

      {session.notes && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10">
          <FileText className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-white/80 leading-relaxed">
            {session.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default GlassEventRow;
