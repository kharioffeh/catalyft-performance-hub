import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { networkMonitor } from '../../services/offline/networkMonitor';
import { syncQueue } from '../../services/offline/syncQueue';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OfflineBannerProps {
  autoDismiss?: boolean;
  dismissDelay?: number;
  onPress?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  autoDismiss = true,
  dismissDelay = 3000,
  onPress,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!networkMonitor.isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [wasOffline, setWasOffline] = useState(false);
  const translateY = useState(new Animated.Value(-100))[0];
  const opacity = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Subscribe to network changes
    const handleNetworkChange = (status: any) => {
      const nowOffline = !status.isConnected || !status.isInternetReachable;
      
      if (nowOffline && !isOffline) {
        // Just went offline
        setIsOffline(true);
        setWasOffline(true);
        setIsVisible(true);
      } else if (!nowOffline && isOffline) {
        // Just came online
        setIsOffline(false);
        if (autoDismiss) {
          setTimeout(() => {
            setIsVisible(false);
            setWasOffline(false);
          }, dismissDelay);
        }
      }
    };

    networkMonitor.on('status', handleNetworkChange);

    // Subscribe to sync queue changes
    const unsubscribeQueue = syncQueue.subscribe((queue) => {
      const pending = queue.filter(op => op.status === 'pending').length;
      setPendingCount(pending);
    });

    // Initial check
    if (isOffline) {
      setIsVisible(true);
      setWasOffline(true);
    }

    return () => {
      networkMonitor.off('status', handleNetworkChange);
      unsubscribeQueue();
    };
  }, [isOffline, autoDismiss, dismissDelay]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateY, opacity]);

  if (!isVisible && !wasOffline) {
    return null;
  }

  const getBannerStyle = () => {
    if (isOffline) {
      return styles.offlineBanner;
    }
    return styles.onlineBanner;
  };

  const getIcon = () => {
    if (isOffline) {
      return <Ionicons name="cloud-offline" size={20} color="#FFF" />;
    }
    return <Ionicons name="checkmark-circle" size={20} color="#FFF" />;
  };

  const getMessage = () => {
    if (isOffline) {
      return (
        <>
          <Text style={styles.title}>You're offline</Text>
          <Text style={styles.subtitle}>
            {pendingCount > 0 
              ? `${pendingCount} changes will sync when reconnected`
              : 'Your changes will sync when reconnected'}
          </Text>
        </>
      );
    }
    return (
      <>
        <Text style={styles.title}>Back online!</Text>
        <Text style={styles.subtitle}>
          {pendingCount > 0 
            ? `Syncing ${pendingCount} changes...`
            : 'All changes synced'}
        </Text>
      </>
    );
  };

  const getFeatureList = () => {
    if (!isOffline) return null;

    return (
      <View style={styles.featureList}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
          <Text style={styles.featureText}>Continue workouts</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
          <Text style={styles.featureText}>Log meals & water</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
          <Text style={styles.featureText}>View recent history</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getBannerStyle(),
        {
          transform: [{ translateY }],
          opacity,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.content}
      >
        <View style={styles.header}>
          {getIcon()}
          <View style={styles.textContainer}>
            {getMessage()}
          </View>
          {onPress && (
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          )}
        </View>
        {isOffline && getFeatureList()}
      </TouchableOpacity>

      {!isOffline && autoDismiss && (
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${100}%`,
              },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  offlineBanner: {
    backgroundColor: '#FF6B6B',
  },
  onlineBanner: {
    backgroundColor: '#6BCF7F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featureList: {
    marginTop: 12,
    marginLeft: 32,
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
});