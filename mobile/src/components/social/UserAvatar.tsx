import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface UserAvatarProps {
  uri?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onPress?: () => void;
  isOnline?: boolean;
  hasStory?: boolean;
  isVerified?: boolean;
  showBadge?: boolean;
  badgeCount?: number;
  style?: any;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  size = 'medium',
  onPress,
  isOnline,
  hasStory,
  isVerified,
  showBadge,
  badgeCount = 0,
  style,
}) => {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  };

  const avatarSize = sizes[size];
  const borderWidth = hasStory ? 3 : 0;

  const AvatarContent = () => (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {hasStory && (
        <LinearGradient
          colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
          style={[
            styles.storyRing,
            {
              width: avatarSize + 6,
              height: avatarSize + 6,
              borderRadius: (avatarSize + 6) / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      <View
        style={[
          styles.avatarContainer,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderWidth,
            borderColor: 'white',
          },
        ]}
      >
        <Image
          source={{ uri: uri || 'https://via.placeholder.com/150' }}
          style={[
            styles.avatar,
            {
              width: avatarSize - borderWidth * 2,
              height: avatarSize - borderWidth * 2,
              borderRadius: (avatarSize - borderWidth * 2) / 2,
            },
          ]}
        />
        
        {isVerified && size !== 'small' && (
          <View
            style={[
              styles.verifiedBadge,
              {
                bottom: size === 'xlarge' ? 4 : 0,
                right: size === 'xlarge' ? 4 : 0,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={size === 'xlarge' ? 24 : 16} color="#4CAF50" />
          </View>
        )}
      </View>

      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: avatarSize * 0.25,
              height: avatarSize * 0.25,
              borderRadius: avatarSize * 0.125,
              bottom: size === 'small' ? -2 : 0,
              right: size === 'small' ? -2 : 0,
            },
          ]}
        />
      )}

      {showBadge && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    backgroundColor: 'white',
  },
  avatar: {
    backgroundColor: '#F0F0F0',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});