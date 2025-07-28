import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Activity } from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { Session } from '@/types/training';
import { useGlassToast } from '@/hooks/useGlassToast';
import { SessionCard as NewSessionCard } from '@/features/calendar/SessionCard';

interface SessionCardProps {
  session: Session;
}

const SessionCardWrapper: React.FC<SessionCardProps> = ({ session }) => {
  return (
    <View style={styles.sessionWrapper}>
      <NewSessionCard session={session} />
    </View>
  );
};

const SessionList: React.FC = () => {
  const { sessions, isLoading } = useCalendar();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
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
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCardWrapper session={item} />}
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
    marginBottom: 12,
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