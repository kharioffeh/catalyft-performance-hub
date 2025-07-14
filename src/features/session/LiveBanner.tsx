import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Play, Square, Clock } from 'lucide-react';
import { useActiveSession } from '@/hooks/useActiveSession';
import { updateSessionStatus } from '@/lib/api/sessions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGlassToast } from '@/hooks/useGlassToast';

export const LiveBanner: React.FC = () => {
  const { data: activeSession } = useActiveSession();
  const [elapsedTime, setElapsedTime] = useState(0);
  const queryClient = useQueryClient();
  const toast = useGlassToast();

  const endSessionMutation = useMutation({
    mutationFn: (sessionId: string) => 
      updateSessionStatus(sessionId, 'completed', new Date().toISOString()),
    onMutate: async (sessionId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['activeSession'] });
      const previousSession = queryClient.getQueryData(['activeSession']);
      queryClient.setQueryData(['activeSession'], null);
      return { previousSession };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['activeSession'], context?.previousSession);
      toast.error('Session End Failed', 'Could not end the session. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session Completed', 'Your training session has been completed.');
    },
  });

  // Update elapsed time every second
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeSession.start_ts).getTime();
    
    const updateTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    if (activeSession) {
      endSessionMutation.mutate(activeSession.id);
    }
  };

  if (!activeSession) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Now</Text>
          </View>
          <Clock size={16} color="#fff" style={styles.clockIcon} />
          <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.endButton}
          onPress={handleEndSession}
          disabled={endSessionMutation.isPending}
        >
          <Square size={16} color="#fff" />
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 0 : 44, // Account for status bar on mobile
    left: 0,
    right: 0,
    backgroundColor: '#3b82f6', // Primary color
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        position: 'fixed' as any,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  liveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clockIcon: {
    marginLeft: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'SF Mono' : 'monospace',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});