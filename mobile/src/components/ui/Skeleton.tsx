/**
 * Catalyft Fitness App - Skeleton Component
 * Loading placeholders for content
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from '../../utils/reanimated-mock';
import { theme } from '../../theme';

export type SkeletonVariant = 'text' | 'title' | 'button' | 'avatar' | 'card' | 'image' | 'custom';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  lines?: number;
  animated?: boolean;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  borderRadius,
  lines = 1,
  animated = true,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  // Animation value
  const shimmerAnimation = useSharedValue(0);
  
  // Start shimmer animation
  useEffect(() => {
    if (animated) {
      shimmerAnimation.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: theme.animation.easing.ease,
        }),
        -1,
        false
      );
    }
  }, [animated, shimmerAnimation]);
  
  // Get dimensions based on variant
  const getDimensions = (): { width: number | string; height: number | string; borderRadius: number } => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || theme.dimensions.skeletonHeight,
          borderRadius: borderRadius || theme.dimensions.skeletonRadius,
        };
      case 'title':
        return {
          width: width || '60%',
          height: height || theme.dimensions.skeletonHeight * 2,
          borderRadius: borderRadius || theme.dimensions.skeletonRadius,
        };
      case 'button':
        return {
          width: width || 120,
          height: height || theme.dimensions.buttonHeight,
          borderRadius: borderRadius || theme.borderRadius.button,
        };
      case 'avatar':
        const size = width || 48;
        return {
          width: size,
          height: height || size,
          borderRadius: borderRadius || theme.borderRadius.full,
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || 120,
          borderRadius: borderRadius || theme.borderRadius.card,
        };
      case 'image':
        return {
          width: width || '100%',
          height: height || 200,
          borderRadius: borderRadius || theme.borderRadius.lg,
        };
      case 'custom':
      default:
        return {
          width: width || '100%',
          height: height || theme.dimensions.skeletonHeight,
          borderRadius: borderRadius || theme.dimensions.skeletonRadius,
        };
    }
  };
  
  const dimensions = getDimensions();
  
  // Animated shimmer style
  const animatedShimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnimation.value,
      [0, 1],
      [-200, 200]
    );
    
    return {
      transform: [{ translateX }],
    };
  });
  
  // Base skeleton style
  const baseStyle: ViewStyle = {
    backgroundColor: isDark ? colors.surfaceSecondary : colors.backgroundTertiary,
    overflow: 'hidden',
    width: dimensions.width as any,
    height: dimensions.height as any,
    borderRadius: dimensions.borderRadius,
  };
  
  // Render single skeleton
  const renderSkeleton = (key?: number) => (
    <View key={key} style={[baseStyle, style]}>
      {animated && (
        <Animated.View style={[styles.shimmer, animatedShimmerStyle]}>
          <View
            style={[
              styles.shimmerGradient,
              {
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
  
  // Render multiple lines for text
  if (variant === 'text' && lines > 1) {
    return (
      <View style={styles.textContainer}>
        {Array.from({ length: lines }, (_, index) => (
          <View key={index} style={index > 0 ? styles.textLine : undefined}>
            {renderSkeleton()}
            {index === lines - 1 && (
              <View style={{ width: '60%' }}>
                {renderSkeleton()}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  }
  
  return renderSkeleton();
};

// Preset skeleton components
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="text" {...props} />
);

export const SkeletonTitle: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="title" {...props} />
);

export const SkeletonButton: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="button" {...props} />
);

export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="avatar" {...props} />
);

export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="card" {...props} />
);

export const SkeletonImage: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="image" {...props} />
);

// Skeleton list item preset
export const SkeletonListItem: React.FC<{ showAvatar?: boolean }> = ({ showAvatar = true }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  return (
    <View style={[styles.listItem, { backgroundColor: colors.surface }]}>
      {showAvatar && <SkeletonAvatar />}
      <View style={styles.listItemContent}>
        <SkeletonText width="70%" />
        <View style={styles.listItemSubtitle}>
          <SkeletonText width="40%" height={10} />
        </View>
      </View>
    </View>
  );
};

// Skeleton exercise card preset
export const SkeletonExerciseCard: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  return (
    <View style={[styles.exerciseCard, { backgroundColor: colors.surface }]}>
      <View style={styles.exerciseCardHeader}>
        <SkeletonImage width={60} height={60} />
        <View style={styles.exerciseCardInfo}>
          <SkeletonTitle width="60%" />
          <View style={styles.exerciseCardTags}>
            <SkeletonText width={60} height={20} borderRadius={10} />
            <SkeletonText width={80} height={20} borderRadius={10} />
          </View>
        </View>
        <SkeletonAvatar width={50} />
      </View>
      <View style={styles.exerciseCardStats}>
        {Array.from({ length: 4 }, (_, i) => (
          <View key={i} style={styles.exerciseCardStat}>
            <SkeletonText width={30} height={20} />
            <SkeletonText width={40} height={10} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: 100,
    height: '100%',
    opacity: 0.5,
  },
  textContainer: {
    width: '100%',
  },
  textLine: {
    marginTop: theme.spacing.s2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.s4,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.s3,
  },
  listItemContent: {
    flex: 1,
    marginLeft: theme.spacing.s3,
  },
  listItemSubtitle: {
    marginTop: theme.spacing.s2,
  },
  exerciseCard: {
    padding: theme.spacing.s4,
    borderRadius: theme.borderRadius.card,
    marginBottom: theme.spacing.s3,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCardInfo: {
    flex: 1,
    marginLeft: theme.spacing.s3,
  },
  exerciseCardTags: {
    flexDirection: 'row',
    gap: theme.spacing.s2,
    marginTop: theme.spacing.s2,
  },
  exerciseCardStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.s4,
    paddingTop: theme.spacing.s3,
    borderTopWidth: theme.borderWidth.hairline,
    borderTopColor: theme.colors.light.border,
  },
  exerciseCardStat: {
    flex: 1,
    alignItems: 'center',
  },
});

export default Skeleton;