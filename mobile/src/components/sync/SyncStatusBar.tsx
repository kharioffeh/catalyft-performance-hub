import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { networkMonitor } from '../../services/offline/networkMonitor';
import { syncQueue } from '../../services/offline/syncQueue';
import { syncEngine } from '../../services/offline/syncEngine';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusBarProps {
  onPress?: () => void;
  minimal?: boolean;
  showDetails?: boolean;
}

export const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  onPress,
  minimal = false,
  showDetails = true,
}) => {
  const [isOnline, setIsOnline] = useState(networkMonitor.isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [connectionQuality, setConnectionQuality] = useState(networkMonitor.getConnectionQuality());
  const fadeAnim = useState(new Animated.Value(1))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Subscribe to network changes
    const handleNetworkChange = (status: any) => {
      setIsOnline(status.isConnected && status.isInternetReachable);
      setConnectionQuality(status.quality);
    };

    networkMonitor.on('status', handleNetworkChange);

    // Subscribe to sync queue changes
    const unsubscribeQueue = syncQueue.subscribe((queue) => {
      const pending = queue.filter(op => op.status === 'pending').length;
      const syncing = queue.filter(op => op.status === 'syncing').length;
      setPendingCount(pending);
      setIsSyncing(syncing > 0);
    });

    // Subscribe to sync engine events
    const unsubscribeSync = syncEngine.onSync((result) => {
      setLastSyncTime(result.timestamp);
      setIsSyncing(false);
      
      // Animate on successful sync
      if (result.success) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    // Initial status check
    const queueStats = syncQueue.getStats();
    setPendingCount(queueStats.pending);
    
    const syncStatus = syncEngine.getSyncStatus();
    setIsSyncing(syncStatus.inProgress);

    return () => {
      networkMonitor.off('status', handleNetworkChange);
      unsubscribeQueue();
      unsubscribeSync();
    };
  }, []);

  // Pulse animation for syncing
  useEffect(() => {
    if (isSyncing) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      fadeAnim.setValue(1);
    }
  }, [isSyncing, fadeAnim]);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <Ionicons name="cloud-offline" size={16} color="#FF6B6B" />;
    }
    if (isSyncing) {
      return <ActivityIndicator size="small" color="#4ECDC4" />;
    }
    if (pendingCount > 0) {
      return <Ionicons name="cloud-upload" size={16} color="#FFD93D" />;
    }
    return <Ionicons name="cloud-done" size={16} color="#6BCF7F" />;
  };

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline';
    }
    if (isSyncing) {
      return 'Syncing...';
    }
    if (pendingCount > 0) {
      return `${pendingCount} pending`;
    }
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return '#FF6B6B';
    if (isSyncing) return '#4ECDC4';
    if (pendingCount > 0) return '#FFD93D';
    return '#6BCF7F';
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Ionicons name="wifi" size={12} color="#6BCF7F" />;
      case 'good':
        return <Ionicons name="wifi" size={12} color="#4ECDC4" />;
      case 'fair':
        return <Ionicons name="wifi" size={12} color="#FFD93D" />;
      case 'poor':
        return <Ionicons name="wifi" size={12} color="#FFA500" />;
      default:
        return null;
    }
  };

  if (minimal) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.minimalContainer}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: pulseAnim }] }}>
          {getStatusIcon()}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.container,
          { 
            opacity: isSyncing ? fadeAnim : 1,
            borderColor: getStatusColor(),
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <View style={styles.leftSection}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {isOnline && getConnectionIcon()}
        </View>

        {showDetails && (
          <View style={styles.rightSection}>
            {lastSyncTime && !isSyncing && (
              <Text style={styles.timeText}>
                {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  minimalContainer: {
    padding: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
});