import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';

interface SessionTimerProps {
  startTime?: Date;
  pausedTime?: number; // Total paused duration in seconds
  status?: 'active' | 'paused';
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  startTime,
  pausedTime = 0,
  status = 'active',
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime || status !== 'active') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime.getTime()) / 1000) - pausedTime;
      setElapsedTime(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, pausedTime, status]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (status === 'paused') return '#f59e0b';
    if (elapsedTime > 7200) return '#ef4444'; // Over 2 hours - red
    if (elapsedTime > 3600) return '#f59e0b'; // Over 1 hour - amber
    return '#22c55e'; // Normal - green
  };

  return (
    <View style={styles.container}>
      <Clock size={16} color={getTimerColor()} />
      <Text style={[styles.timeText, { color: getTimerColor() }]}>
        {formatTime(elapsedTime)}
      </Text>
      {status === 'paused' && (
        <Text style={styles.pausedLabel}>PAUSED</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pausedLabel: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});

export default SessionTimer;