import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Activity } from 'lucide-react';
import { useCalendar, Session } from '@/hooks/useCalendar';
import { rescheduleSession } from '@/lib/api/sessions';
import { useGlassToast } from '@/hooks/useGlassToast';
import { SessionCard as NewSessionCard } from '@/features/calendar/SessionCard';

interface DraggableSessionCardProps extends RenderItemParams<Session> {}

const DraggableSessionCard: React.FC<DraggableSessionCardProps> = ({ item: session, drag, isActive }) => {
  return (
    <View 
      style={[
        styles.sessionWrapper,
        isActive && styles.activeWrapper
      ]}
      onTouchStart={drag}
    >
      <NewSessionCard session={session} />
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
        renderItem={(props) => <DraggableSessionCard {...props} />}
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
  sessionWrapper: {
    marginBottom: 0, // Remove margin since SessionCard handles it
  },
  activeWrapper: {
    transform: [{ scale: 1.02 }],
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