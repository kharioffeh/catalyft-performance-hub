/**
 * Catalyft Fitness App - Empty State Component
 * Engaging empty states with illustrations and actions
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';
import Button from './Button';

export type EmptyStateType = 
  | 'no-data'
  | 'no-workouts'
  | 'no-exercises'
  | 'no-meals'
  | 'no-progress'
  | 'error'
  | 'offline'
  | 'search'
  | 'custom';

export interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: React.ReactNode;
  emoji?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  animated?: boolean;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  icon,
  emoji,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  animated = true,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation values
  const scaleAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);
  const bounceAnimation = useSharedValue(0);
  
  // Get content based on type
  const getContent = () => {
    switch (type) {
      case 'no-workouts':
        return {
          emoji: '💪',
          title: title || 'No Workouts Yet',
          message: message || 'Start your fitness journey by creating your first workout plan!',
          actionLabel: actionLabel || 'Create Workout',
        };
      case 'no-exercises':
        return {
          emoji: '🏋️',
          title: title || 'No Exercises Found',
          message: message || 'Add exercises to your workout to get started.',
          actionLabel: actionLabel || 'Browse Exercises',
        };
      case 'no-meals':
        return {
          emoji: '🍽️',
          title: title || 'No Meals Logged',
          message: message || 'Track your nutrition by logging your meals.',
          actionLabel: actionLabel || 'Log Meal',
        };
      case 'no-progress':
        return {
          emoji: '📊',
          title: title || 'No Progress Data',
          message: message || 'Complete workouts to see your progress here.',
          actionLabel: actionLabel || 'Start Workout',
        };
      case 'error':
        return {
          emoji: '😕',
          title: title || 'Something Went Wrong',
          message: message || 'We encountered an error. Please try again.',
          actionLabel: actionLabel || 'Retry',
        };
      case 'offline':
        return {
          emoji: '📡',
          title: title || 'You\'re Offline',
          message: message || 'Check your internet connection and try again.',
          actionLabel: actionLabel || 'Retry',
        };
      case 'search':
        return {
          emoji: '🔍',
          title: title || 'No Results Found',
          message: message || 'Try adjusting your search or filters.',
          actionLabel: actionLabel || 'Clear Filters',
        };
      case 'custom':
        return {
          emoji: emoji || '📦',
          title: title || 'No Content',
          message: message || 'There\'s nothing here yet.',
          actionLabel: actionLabel,
        };
      default:
        return {
          emoji: '📦',
          title: title || 'No Data',
          message: message || 'There\'s nothing to show here yet.',
          actionLabel: actionLabel,
        };
    }
  };
  
  const content = getContent();
  
  // Start animations on mount
  useEffect(() => {
    if (animated) {
      // Scale in animation
      scaleAnimation.value = withSpring(1, theme.animation.spring.bouncy);
      
      // Rotation animation for emoji
      rotationAnimation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 1000 }),
          withTiming(10, { duration: 2000 }),
          withTiming(-10, { duration: 1000 })
        ),
        -1,
        true
      );
      
      // Bounce animation
      bounceAnimation.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      );
    } else {
      scaleAnimation.value = 1;
    }
  }, [animated, scaleAnimation, rotationAnimation, bounceAnimation]);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));
  
  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotationAnimation.value}deg` },
      { translateY: bounceAnimation.value },
    ],
  }));
  
  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      {/* Icon or Emoji */}
      {icon || content.emoji && (
        <Animated.View style={[styles.iconContainer, animatedEmojiStyle]}>
          {icon || (
            <Text style={styles.emoji}>{content.emoji}</Text>
          )}
        </Animated.View>
      )}
      
      {/* Title */}
      {content.title && (
        <Text style={[styles.title, { color: colors.text }]}>
          {content.title}
        </Text>
      )}
      
      {/* Message */}
      {content.message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {content.message}
        </Text>
      )}
      
      {/* Actions */}
      {(content.actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {content.actionLabel && onAction && (
            <Button
              title={content.actionLabel}
              variant="primary"
              size="medium"
              onPress={onAction}
              style={styles.actionButton}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              variant="outline"
              size="medium"
              onPress={onSecondaryAction}
              style={styles.actionButton}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

// Preset empty states
export const NoWorkoutsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-workouts" {...props} />
);

export const NoExercisesEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-exercises" {...props} />
);

export const NoMealsEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-meals" {...props} />
);

export const NoProgressEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="no-progress" {...props} />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="error" {...props} />
);

export const OfflineEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="offline" {...props} />
);

export const SearchEmptyState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState type="search" {...props} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.s8,
  },
  iconContainer: {
    marginBottom: theme.spacing.s6,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    ...theme.typography.styles.h4,
    textAlign: 'center',
    marginBottom: theme.spacing.s3,
  },
  message: {
    ...theme.typography.styles.bodyMedium,
    textAlign: 'center',
    marginBottom: theme.spacing.s6,
    maxWidth: 300,
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.s3,
    width: '100%',
    maxWidth: 250,
  },
  actionButton: {
    width: '100%',
  },
});

export default EmptyState;