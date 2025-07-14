import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { format } from 'date-fns';
import { Activity, Clock, User } from 'lucide-react';
import { useCalendar, Session } from '@/hooks/useCalendar';
import { rescheduleSession } from '@/lib/api/sessions';
import { useGlassToast } from '@/hooks/useGlassToast';

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

interface SessionCardProps extends RenderItemParams<Session> {}

const SessionCard: React.FC<SessionCardProps> = ({ item: session, drag, isActive }) => {
  return (
    <View 
      style={[
        styles.sessionCard,
        isActive && styles.activeCard
      ]}
      onTouchStart={drag}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.sessionIcon}>{getSessionIcon(session.type)}</Text>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
        </Text>
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
        
        {session.athletes?.name && (
          <View style={styles.athleteRow}>
            <User size={14} color="#888" />
            <Text style={styles.athleteText} numberOfLines={1}>
              {session.athletes.name}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SessionList: React.FC = () => {
  const { sessions, isLoading, queryClient } = useCalendar();
  const [sessionList, setSessionList] = useState<Session[]>(sessions);
  const toast = useGlassToast();

  // Update local state when sessions change
  React.useEffect(() => {
    setSessionList(sessions);
  }, [sessions]);

  const handleDragEnd = async ({ data, from, to }: { data: Session[], from: number, to: number }) => {
    // Optimistic update
    setSessionList(data);

    try {
      // Calculate new date based on position change
      const movedSession = data[to];
      const targetSession = sessions[to];
      
      if (targetSession && movedSession.id !== targetSession.id) {
        const newDate = new Date(targetSession.start_ts);
        await rescheduleSession(movedSession.id, newDate);
        
        // Invalidate queries to refetch fresh data
        queryClient?.invalidateQueries({ queryKey: ['sessions'] });
        
        toast.success("Session Rescheduled", "Session has been moved successfully");
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
      // Revert optimistic update on error
      setSessionList(sessions);
      toast.error("Reschedule Failed", "Could not move the session. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  if (sessionList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Activity size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>No Sessions Scheduled</Text>
        <Text style={styles.emptyText}>Your training sessions will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={sessionList}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={SessionCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
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
  },
  activeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
  cardContent: {
    gap: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default SessionList;