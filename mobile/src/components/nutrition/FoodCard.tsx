/**
 * FoodCard Component
 * Displays food item information with quick add functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Food, MacroNutrients } from '../../types/nutrition';
import { theme } from '../../theme';

interface FoodCardProps {
  food: Food;
  onPress?: () => void;
  onQuickAdd?: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  showMacros?: boolean;
  showImage?: boolean;
  compact?: boolean;
  quantity?: number;
  unit?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  onQuickAdd,
  onFavoriteToggle,
  isFavorite = false,
  showMacros = true,
  showImage = true,
  compact = false,
  quantity,
  unit,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  const styles = createStyles(colors, compact);

  // Calculate nutrition based on quantity if provided
  const multiplier = quantity ? quantity / food.servingSize : 1;
  const displayCalories = Math.round(food.calories * multiplier);
  const displayMacros: MacroNutrients = {
    protein: Math.round(food.macros.protein * multiplier * 10) / 10,
    carbs: Math.round(food.macros.carbs * multiplier * 10) / 10,
    fat: Math.round(food.macros.fat * multiplier * 10) / 10,
  };

  const servingText = quantity
    ? `${quantity} ${unit || food.servingUnit}`
    : `${food.servingSize} ${food.servingUnit}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {showImage && food.imageUrl && !compact && (
          <Image source={{ uri: food.imageUrl }} style={styles.image} />
        )}

        <View style={styles.info}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name} numberOfLines={compact ? 1 : 2}>
                {food.name}
              </Text>
              {food.brand && (
                <Text style={styles.brand} numberOfLines={1}>
                  {food.brand}
                </Text>
              )}
            </View>

            {!compact && (
              <View style={styles.actions}>
                {onFavoriteToggle && (
                  <TouchableOpacity
                    onPress={onFavoriteToggle}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? colors.error : colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                {onQuickAdd && (
                  <TouchableOpacity
                    onPress={onQuickAdd}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.nutritionInfo}>
            <View style={styles.caloriesContainer}>
              <Text style={styles.calories}>{displayCalories}</Text>
              <Text style={styles.caloriesLabel}>cal</Text>
              <Text style={styles.serving}>• {servingText}</Text>
            </View>

            {showMacros && !compact && (
              <View style={styles.macros}>
                <MacroItem
                  label="P"
                  value={displayMacros.protein}
                  color={colors.primary}
                />
                <MacroItem
                  label="C"
                  value={displayMacros.carbs}
                  color={colors.warning}
                />
                <MacroItem
                  label="F"
                  value={displayMacros.fat}
                  color={colors.success}
                />
              </View>
            )}
          </View>

          {food.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {compact && onQuickAdd && (
          <TouchableOpacity
            onPress={onQuickAdd}
            style={styles.compactAddButton}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const MacroItem: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}g</Text>
  </View>
);

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius.lg,
      marginVertical: theme.spacing.xs,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    content: {
      flexDirection: 'row',
      padding: compact ? theme.spacing.sm : theme.spacing.md,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: compact ? 0 : theme.spacing.xs,
    },
    titleContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    name: {
      fontSize: compact ? 14 : 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    brand: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    nutritionInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: compact ? theme.spacing.xs : theme.spacing.sm,
    },
    caloriesContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    calories: {
      fontSize: compact ? 16 : 18,
      fontWeight: '700',
      color: colors.text,
    },
    caloriesLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 2,
    },
    serving: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    macros: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    macroItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.md,
    },
    macroDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
    },
    macroLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginRight: 2,
    },
    macroValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    verifiedText: {
      fontSize: 11,
      color: colors.success,
      marginLeft: 4,
    },
    compactAddButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xs,
    },
  });

export default FoodCard;