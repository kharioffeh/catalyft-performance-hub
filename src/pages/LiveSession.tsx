import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LiveWorkoutSession } from '@/components/training/LiveWorkoutSession';
import { LiveBanner } from '@/features/session/LiveBanner';

const LiveSession: React.FC = () => {
  return (
    <View style={styles.container}>
      <LiveBanner />
      <View style={styles.content}>
        <LiveWorkoutSession />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 56, // Account for banner height
  },
});

export default LiveSession;