import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Play, Clock, User } from 'lucide-react';
import { updateSessionStatus } from '@/lib/api/sessions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlassToast } from '@/hooks/useGlassToast';
import { Session } from '@/types/training';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

// Session type icons mapping
const getSessionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'strength':
      return '💪';
    case 'conditioning':
      return '🏃';
    case 'recovery':
      return '🧘';
    case 'technical':
      return '🎯';
    default:
      return '🏋️';
  }
};

// Calculate session duration
const getSessionDuration = (startTs: string, endTs: string) => {
  const start = new Date(startTs);
  const end = new Date(endTs);
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
  const queryClient = useQueryClient();
  const toast = useGlassToast();

  const startSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      updateSessionStatus(sessionId, 'active', new Date().toISOString()),
    onMutate: async (sessionId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['sessions'] });
      const previousSessions = queryClient.getQueryData(['sessions']);
      
      // Update the session status in cache
      queryClient.setQueryData(['sessions'], (old: Session[] | undefined) => 
        old?.map(s => s.id === sessionId ? { ...s, status: 'active' as const } : s)
      );
      
      return { previousSessions };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['sessions'], context?.previousSessions);
      toast.error('Session Start Failed', 'Could not start the session. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      toast.success('Session Started', 'Your training session is now active.');
    },
  });

  const handleStartSession = () => {
    startSessionMutation.mutate(session.id);
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'active':
        return '#22c55e'; // green
      case 'completed':
        return '#64748b'; // gray
      default:
        return '#3b82f6'; // blue
    }
  };

  return (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.sessionIcon}>{getSessionIcon(session.type)}</Text>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{session.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.timeRow}>
          <Clock size={14} color="#888" />
          <Text style={styles.timeText}>
            {format(new Date(session.start_ts), 'HH:mm')}
          </Text>
          <Text style={styles.durationText}>
            • {getSessionDuration(session.start_ts, session.end_ts)}
          </Text>
        </View>
        
        {session.user_uuid && (
          <View style={styles.athleteRow}>
            <User size={14} color="#888" />
            <Text style={styles.athleteText} numberOfLines={1}>
              User: {session.user_uuid.slice(0, 8)}...
            </Text>
          </View>
        )}

        {session.status === 'planned' && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartSession}
            disabled={startSessionMutation.isPending}
          >
            <Play size={16} color="#fff" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardContent: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 14,
    color: '#ccc',
  },
  athleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  athleteText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'hsl(var(--primary))',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});