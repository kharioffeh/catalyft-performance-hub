import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedLikeButton } from './AnimatedLikeButton';

interface EngagementBarProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onDoubleTap?: () => void;
  showCounts?: boolean;
}

export const EngagementBar: React.FC<EngagementBarProps> = ({
  liked,
  likeCount,
  commentCount,
  shareCount,
  onLike,
  onComment,
  onShare,
  onDoubleTap,
  showCounts = true,
}) => {
  const renderActionButton = (
    icon: string,
    label: string,
    count: number,
    onPress: () => void,
    isActive: boolean = false,
    iconColor?: string
  ) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={20}
        color={iconColor || (isActive ? '#FF6B6B' : '#666')}
      />
      {showCounts && count > 0 && (
        <Text style={[
          styles.actionCount,
          { color: isActive ? '#FF6B6B' : '#666' }
        ]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Left side - Like button */}
      <View style={styles.leftActions}>
        <AnimatedLikeButton
          liked={liked}
          count={likeCount}
          onPress={onLike}
          onDoubleTap={onDoubleTap}
          size="medium"
        />
      </View>

      {/* Right side - Comment and Share */}
      <View style={styles.rightActions}>
        {renderActionButton(
          'chatbubble-outline',
          'Comment',
          commentCount,
          onComment
        )}
        
        {renderActionButton(
          'share-outline',
          'Share',
          shareCount,
          onShare
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});