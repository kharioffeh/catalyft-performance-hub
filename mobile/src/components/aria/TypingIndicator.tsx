import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 1,
              duration: 600,
              delay: 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 1,
              duration: 600,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.3,
              duration: 600,
              delay: 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.3,
              duration: 600,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [isVisible, dot1Opacity, dot2Opacity, dot3Opacity]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View 
            style={[styles.typingDot, { opacity: dot1Opacity }]} 
          />
          <Animated.View 
            style={[styles.typingDot, { opacity: dot2Opacity }]} 
          />
          <Animated.View 
            style={[styles.typingDot, { opacity: dot3Opacity }]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  typingBubble: {
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9E9E9E',
    marginHorizontal: 2,
  },
});