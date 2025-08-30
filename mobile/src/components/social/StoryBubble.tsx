import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_SIZE = SCREEN_WIDTH * 0.18; // 18% of screen width

interface StoryBubbleProps {
  avatar?: string;
  viewed: boolean;
  gradient?: string[] | null;
  username?: string;
  onPress?: () => void;
}

export const StoryBubble: React.FC<StoryBubbleProps> = ({
  avatar,
  viewed,
  gradient,
  username,
  onPress,
}) => {
  const renderAvatar = () => {
    if (avatar) {
      return (
        <Image
          source={{ uri: avatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      );
    }
    
    // Fallback avatar with initials
    return (
      <View style={[styles.avatar, styles.fallbackAvatar]}>
        <Text style={styles.fallbackText}>
          {username?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
    );
  };

  const renderStoryRing = () => {
    if (viewed || !gradient) {
      return (
        <View style={[styles.storyRing, styles.viewedRing]}>
          {renderAvatar()}
        </View>
      );
    }

    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyRing}
      >
        <View style={styles.innerRing}>
          {renderAvatar()}
        </View>
      </LinearGradient>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {renderStoryRing()}
      {username && (
        <Text style={styles.username} numberOfLines={1}>
          {username}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: STORY_SIZE,
  },
  storyRing: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  viewedRing: {
    backgroundColor: '#E0E0E0',
  },
  innerRing: {
    width: '100%',
    height: '100%',
    borderRadius: (STORY_SIZE - 4) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  avatar: {
    width: STORY_SIZE - 8,
    height: STORY_SIZE - 8,
    borderRadius: (STORY_SIZE - 8) / 2,
  },
  fallbackAvatar: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 11,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
});