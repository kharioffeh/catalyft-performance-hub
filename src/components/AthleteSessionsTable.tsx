
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AthleteSessionsTableProps {
  athleteId: string;
}

interface SessionData {
  id: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes: string | null;
}

export const AthleteSessionsTable: React.FC<AthleteSessionsTableProps> = ({
  athleteId,
}) => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['athleteSessions', athleteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, type, start_ts, end_ts, notes')
        .eq('athlete_uuid', athleteId)
        .order('start_ts', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as SessionData[];
    },
    enabled: !!athleteId,
  });

  const getSessionTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength':
        return 'bg-blue-100 text-blue-800';
      case 'cardio':
        return 'bg-green-100 text-green-800';
      case 'recovery':
        return 'bg-purple-100 text-purple-800';
      case 'skill':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMin = Math.round(durationMs / (1000 * 60));
    
    if (durationMin < 60) {
      return `${durationMin}m`;
    } else {
      const hours = Math.floor(durationMin / 60);
      const minutes = durationMin % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent sessions found for this athlete
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>
              {format(new Date(session.start_ts), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <Badge className={getSessionTypeBadgeColor(session.type)}>
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              {calculateDuration(session.start_ts, session.end_ts)}
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {session.notes || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
