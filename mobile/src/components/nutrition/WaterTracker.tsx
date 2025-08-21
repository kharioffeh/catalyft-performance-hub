/**
 * WaterTracker Component
 * Tracks daily water intake with visual progress and quick add buttons
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { QuickAddPreset } from '../../types/nutrition';

interface WaterTrackerProps {
  consumed: number; // in ml
  goal: number; // in ml
  onAddWater: (amount: number) => void;
  onQuickAdd?: (presetId: string) => void;
  quickPresets?: QuickAddPreset[];
  showGlasses?: boolean;
  compact?: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  consumed,
  goal,
  onAddWater,
  onQuickAdd,
  quickPresets = [
    { id: '1', name: 'Glass', amount: 250, unit: 'ml', icon: '🥤' },
    { id: '2', name: 'Bottle', amount: 500, unit: 'ml', icon: '🍶' },
    { id: '3', name: 'Large', amount: 1000, unit: 'ml', icon: '💧' },
  ],
  showGlasses = true,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  const styles = createStyles(colors, compact);

  const progress = useSharedValue(0);
  const percentage = Math.min((consumed / goal) * 100, 100);
  const glassesCount = Math.floor(consumed / 250); // 1 glass = 250ml

  useEffect(() => {
    progress.value = withSpring(percentage / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const animatedWaterStyle = useAnimatedStyle(() => ({
    height: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const getProgressColor = () => {
    if (percentage < 50) return colors.info;
    if (percentage < 80) return colors.primary;
    return colors.success;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Ionicons name="water" size={20} color={colors.primary} />
          <Text style={styles.compactTitle}>Water</Text>
          <Text style={styles.compactValue}>
            {consumed}ml / {goal}ml
          </Text>
        </View>
        <View style={styles.compactProgressBar}>
          <Animated.View
            style={[
              styles.compactProgressFill,
              { backgroundColor: getProgressColor() },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="water" size={24} color={colors.primary} />
          <Text style={styles.title}>Water Intake</Text>
        </View>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.visualContainer}>
        <View style={styles.glassContainer}>
          <View style={styles.glass}>
            <Animated.View
              style={[
                styles.water,
                { backgroundColor: getProgressColor() },
                animatedWaterStyle,
              ]}
            />
            <View style={styles.glassOverlay}>
              <Text style={styles.consumedText}>{consumed}</Text>
              <Text style={styles.unitText}>ml</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>{goal}ml</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {Math.max(0, goal - consumed)}ml
            </Text>
          </View>
          {showGlasses && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Glasses</Text>
              <Text style={styles.statValue}>{glassesCount} 🥤</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: getProgressColor() },
            animatedStyle,
          ]}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetsContainer}
      >
        {quickPresets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={styles.presetButton}
            onPress={() => onQuickAdd ? onQuickAdd(preset.id) : onAddWater(preset.amount)}
          >
            <Text style={styles.presetIcon}>{preset.icon}</Text>
            <Text style={styles.presetAmount}>+{preset.amount}ml</Text>
            <Text style={styles.presetName}>{preset.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.presetButton, styles.customButton]}
          onPress={() => {
            // TODO: Open custom amount modal
          }}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={styles.presetAmount}>Custom</Text>
        </TouchableOpacity>
      </ScrollView>

      {percentage >= 100 && (
        <View style={styles.celebration}>
          <Text style={styles.celebrationText}>🎉 Goal Reached!</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: theme.spacing.sm,
    },
    percentage: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    visualContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    glassContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glass: {
      width: 80,
      height: 100,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.md,
      borderTopLeftRadius: theme.borderRadius.sm,
      borderTopRightRadius: theme.borderRadius.sm,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    water: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      opacity: 0.7,
    },
    glassOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    consumedText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    unitText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    statsContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingLeft: theme.spacing.lg,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    presetsContainer: {
      flexDirection: 'row',
      marginHorizontal: -theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    presetButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      minWidth: 80,
      borderWidth: 1,
      borderColor: colors.border,
    },
    customButton: {
      borderStyle: 'dashed',
    },
    presetIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    presetAmount: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    presetName: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    celebration: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
      backgroundColor: colors.success + '20',
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    celebrationText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
    },
    // Compact styles
    compactContainer: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
    },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    compactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginLeft: theme.spacing.xs,
      flex: 1,
    },
    compactValue: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    compactProgressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    compactProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });

export default WaterTracker;