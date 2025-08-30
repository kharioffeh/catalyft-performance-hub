import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedLikeButtonProps {
  liked: boolean;
  count: number;
  onPress: () => void;
  onDoubleTap?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const AnimatedLikeButton: React.FC<AnimatedLikeButtonProps> = ({
  liked,
  count,
  onPress,
  onDoubleTap,
  size = 'medium',
}) => {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(count);
  const [showHeart, setShowHeart] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(0)).current;
  const countOpacityAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);
  const tapCount = useRef(0);

  useEffect(() => {
    setIsLiked(liked);
    setLikeCount(count);
  }, [liked, count]);

  const animateLike = () => {
    // Scale animation for button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Heart animation
    if (!isLiked) {
      setShowHeart(true);
      Animated.sequence([
        Animated.timing(heartScaleAnim, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeart(false);
      });
    }

    // Count fade animation
    Animated.sequence([
      Animated.timing(countOpacityAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(countOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      tapCount.current = 0;
      if (onDoubleTap) {
        onDoubleTap();
      }
      if (!isLiked) {
        handleLike();
      }
    } else {
      // Single tap
      tapCount.current = 1;
      handleLike();
    }

    lastTap.current = now;
  };

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    
    if (newLiked) {
      setLikeCount(prev => prev + 1);
    } else {
      setLikeCount(prev => Math.max(0, prev - 1));
    }

    animateLike();
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, textSize: 12, padding: 8 };
      case 'large':
        return { iconSize: 24, textSize: 16, padding: 12 };
      default:
        return { iconSize: 20, textSize: 14, padding: 10 };
    }
  };

  const { iconSize, textSize, padding } = getSizeStyles();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { padding }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={iconSize}
            color={isLiked ? '#FF6B6B' : '#666'}
          />
        </Animated.View>
        
        <Animated.Text
          style={[
            styles.count,
            {
              fontSize: textSize,
              opacity: countOpacityAnim,
              color: isLiked ? '#FF6B6B' : '#666',
            },
          ]}
        >
          {likeCount > 0 ? likeCount : ''}
        </Animated.Text>
      </TouchableOpacity>

      {/* Floating heart animation */}
      {showHeart && (
        <Animated.View
          style={[
            styles.floatingHeart,
            {
              transform: [{ scale: heartScaleAnim }],
            },
          ]}
        >
          <Icon name="heart" size={40} color="#FF6B6B" />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  count: {
    fontWeight: '500',
    marginLeft: 2,
  },
  floatingHeart: {
    position: 'absolute',
    top: -20,
    left: -10,
    zIndex: 1000,
  },
});