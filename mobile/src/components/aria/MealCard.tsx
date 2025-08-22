import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { PlannedMeal } from '../../types/ai';

interface MealCardProps {
  meal: PlannedMeal;
  onLog: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onLog }) => {
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'restaurant';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'nutrition';
      default:
        return 'restaurant';
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return ['#FFD93D', '#FFB800'];
      case 'lunch':
        return ['#6BCF7F', '#4CAF50'];
      case 'dinner':
        return ['#667eea', '#764ba2'];
      case 'snack':
        return ['#FF6B6B', '#FF5252'];
      default:
        return ['#667eea', '#764ba2'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getMealColor(meal.mealType)}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Icon name={getMealIcon(meal.mealType)} size={24} color="#fff" />
        <View style={styles.headerContent}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealType}>{meal.mealType}</Text>
        </View>
      </LinearGradient>

      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Icon name="flame" size={20} color="#FF3B30" />
            <Text style={styles.nutritionValue}>{meal.calories}</Text>
            <Text style={styles.nutritionLabel}>cal</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.macroLabel}>P</Text>
            <Text style={styles.nutritionValue}>{meal.protein}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.macroLabel}>C</Text>
            <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.macroLabel}>F</Text>
            <Text style={styles.nutritionValue}>{meal.fats}g</Text>
          </View>
        </View>
      </View>

      {meal.recipe && (
        <View style={styles.recipeSection}>
          <Text style={styles.recipeTitle}>Quick Recipe</Text>
          <View style={styles.timeInfo}>
            <Icon name="time-outline" size={16} color="#666" />
            <Text style={styles.timeText}>
              Prep: {meal.prepTime}min | Cook: {meal.cookTime}min
            </Text>
          </View>
          {meal.recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>
              • {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </Text>
          ))}
          {meal.recipe.ingredients.length > 3 && (
            <Text style={styles.moreIngredients}>
              +{meal.recipe.ingredients.length - 3} more ingredients
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.logButton} onPress={onLog}>
        <LinearGradient
          colors={['#34C759', '#30B251']}
          style={styles.logButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="add-circle" size={20} color="#fff" />
          <Text style={styles.logButtonText}>Log This Meal</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  mealType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  nutritionInfo: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#666',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  recipeSection: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  ingredient: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  moreIngredients: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 5,
  },
  logButton: {
    margin: 10,
  },
  logButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MealCard;