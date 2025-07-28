import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Play, Pause, Square, Clock, Heart, Target, TrendingUp } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInSeconds } from 'date-fns';
import { Session } from '@/types/training';
import { useMetrics } from '@/hooks/useMetrics';
import { StrainDial } from './components/StrainDial';
import { SessionTimer } from './components/SessionTimer';
import { ExerciseTracker } from './components/ExerciseTracker';
import { SessionControls } from './components/SessionControls';
import { supabase } from '@/integrations/supabase/client';
import { useGlassToast } from '@/hooks/useGlassToast';

type ActiveSessionRouteProp = RouteProp<{
  ActiveSession: {
    session: Session;
  };
}, 'ActiveSession'>;

interface SessionState {
  status: 'planned' | 'active' | 'paused' | 'completed';
  startTime?: Date;
  pausedTime?: number; // Total paused duration in seconds
  currentStrain: number;
  targetStrain: number;
  rpe?: number;
  notes?: string;
}

export const ActiveSessionScreen: React.FC = () => {
  const route = useRoute<ActiveSessionRouteProp>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const toast = useGlassToast();
  
  const { session: initialSession } = route.params;
  const { data: metricsData } = useMetrics();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    status: initialSession.status || 'planned',
    currentStrain: metricsData?.strain || 8,
    targetStrain: getTargetStrain(initialSession.type),
    rpe: initialSession.rpe,
    notes: initialSession.notes,
  });

  const [session, setSession] = useState<Session>(initialSession);

  // Calculate target strain based on session type
  function getTargetStrain(sessionType: string): number {
    switch (sessionType.toLowerCase()) {
      case 'strength': return 12;
      case 'conditioning': return 16;
      case 'recovery': return 6;
      case 'technical': return 8;
      case 'hypertrophy': return 14;
      default: return 10;
    }
  }

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (updates: Partial<Session>) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedSession) => {
      setSession(prev => ({ ...prev, ...updatedSession }));
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
    },
    onError: (error) => {
      toast.error('Update Failed', 'Could not update session. Please try again.');
      console.error('Session update error:', error);
    },
  });

  // Start session
  const handleStartSession = () => {
    const now = new Date();
    setSessionState(prev => ({
      ...prev,
      status: 'active',
      startTime: now,
    }));

    updateSessionMutation.mutate({
      status: 'active',
      start_ts: now.toISOString(),
    });

    toast.success('Session Started', 'Your training session is now active.');
  };

  // Pause session
  const handlePauseSession = () => {
    setSessionState(prev => ({
      ...prev,
      status: 'paused',
    }));

    toast.info('Session Paused', 'Take your time. Resume when ready.');
  };

  // Resume session
  const handleResumeSession = () => {
    setSessionState(prev => ({
      ...prev,
      status: 'active',
    }));

    toast.success('Session Resumed', 'Back to training!');
  };

  // End session
  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            const now = new Date();
            setSessionState(prev => ({
              ...prev,
              status: 'completed',
            }));

            updateSessionMutation.mutate({
              status: 'completed',
              end_ts: now.toISOString(),
              strain: sessionState.currentStrain,
              rpe: sessionState.rpe,
              notes: sessionState.notes,
            });

            toast.success('Session Complete', 'Great work! Your session has been saved.');
            
            // Navigate back after a delay
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
          },
        },
      ]
    );
  };

  // Update strain based on activity
  const updateStrain = (newStrain: number) => {
    setSessionState(prev => ({
      ...prev,
      currentStrain: Math.max(0, Math.min(21, newStrain)),
    }));
  };

  // Update RPE
  const updateRPE = (rpe: number) => {
    setSessionState(prev => ({
      ...prev,
      rpe,
    }));
  };

  // Update notes
  const updateNotes = (notes: string) => {
    setSessionState(prev => ({
      ...prev,
      notes,
    }));
  };

  const getStatusColor = () => {
    switch (sessionState.status) {
      case 'active': return '#22c55e';
      case 'paused': return '#f59e0b';
      case 'completed': return '#64748b';
      default: return '#3b82f6';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength': return '💪';
      case 'conditioning': return '🏃';
      case 'recovery': return '🧘';
      case 'technical': return '🎯';
      case 'hypertrophy': return '💪';
      default: return '🏋️';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionIcon}>
              {getSessionIcon(session.type)}
            </Text>
            <View>
              <Text style={styles.sessionTitle}>
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
              </Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{sessionState.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          
          {sessionState.status === 'active' && (
            <SessionTimer 
              startTime={sessionState.startTime}
              pausedTime={sessionState.pausedTime}
            />
          )}
        </View>

        {/* Strain Dial */}
        <View style={styles.strainSection}>
          <Text style={styles.sectionTitle}>Strain Monitor</Text>
          <StrainDial
            currentStrain={sessionState.currentStrain}
            targetStrain={sessionState.targetStrain}
            sessionType={session.type}
          />
          
          <View style={styles.strainInfo}>
            <View style={styles.strainItem}>
              <Heart size={16} color="#ef4444" />
              <Text style={styles.strainLabel}>Current</Text>
              <Text style={styles.strainValue}>{sessionState.currentStrain.toFixed(1)}</Text>
            </View>
            <View style={styles.strainItem}>
              <Target size={16} color="#22c55e" />
              <Text style={styles.strainLabel}>Target</Text>
              <Text style={styles.strainValue}>{sessionState.targetStrain.toFixed(1)}</Text>
            </View>
            <View style={styles.strainItem}>
              <TrendingUp size={16} color="#3b82f6" />
              <Text style={styles.strainLabel}>Optimal Zone</Text>
              <Text style={styles.strainValue}>
                {(sessionState.targetStrain - 2).toFixed(1)}-{(sessionState.targetStrain + 2).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Exercise Tracker */}
        {session.exercises && session.exercises.length > 0 && (
          <ExerciseTracker
            exercises={session.exercises}
            onStrainChange={updateStrain}
            sessionId={session.id}
          />
        )}

        {/* Session Controls */}
        <SessionControls
          status={sessionState.status}
          rpe={sessionState.rpe}
          notes={sessionState.notes}
          onStart={handleStartSession}
          onPause={handlePauseSession}
          onResume={handleResumeSession}
          onEnd={handleEndSession}
          onRPEChange={updateRPE}
          onNotesChange={updateNotes}
          isLoading={updateSessionMutation.isPending}
        />

        {/* Session Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Session Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Clock size={20} color="#3b82f6" />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>
                {sessionState.startTime 
                  ? format(new Date(Date.now() - sessionState.startTime.getTime()), 'mm:ss')
                  : '--:--'
                }
              </Text>
            </View>
            <View style={styles.statCard}>
              <Heart size={20} color="#ef4444" />
              <Text style={styles.statLabel}>Avg Strain</Text>
              <Text style={styles.statValue}>
                {sessionState.currentStrain.toFixed(1)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color="#22c55e" />
              <Text style={styles.statLabel}>Target Hit</Text>
              <Text style={styles.statValue}>
                {Math.abs(sessionState.currentStrain - sessionState.targetStrain) <= 2 ? '✓' : '○'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionIcon: {
    fontSize: 24,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ccc',
  },
  strainSection: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  strainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  strainItem: {
    alignItems: 'center',
    gap: 4,
  },
  strainLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  strainValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ActiveSessionScreen;