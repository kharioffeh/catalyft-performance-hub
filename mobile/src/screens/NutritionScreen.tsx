import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface MacroData {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

interface MealEntry {
  id: string;
  name: string;
  time: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface NutritionGoals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  water: number;
}

const NutritionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([
    {
      id: '1',
      name: 'Oatmeal with Berries',
      time: '8:00 AM',
      calories: 320,
      carbs: 58,
      protein: 12,
      fat: 6,
      type: 'breakfast'
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      time: '12:30 PM',
      calories: 450,
      carbs: 25,
      protein: 45,
      fat: 18,
      type: 'lunch'
    },
    {
      id: '3',
      name: 'Greek Yogurt',
      time: '3:00 PM',
      calories: 150,
      carbs: 12,
      protein: 20,
      fat: 4,
      type: 'snack'
    }
  ]);

  const [nutritionGoals] = useState<NutritionGoals>({
    calories: 2200,
    carbs: 275,
    protein: 165,
    fat: 73,
    water: 8
  });

  const [waterIntake, setWaterIntake] = useState(5);

  const calculateTotals = (): MacroData => {
    return todaysMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        carbs: totals.carbs + meal.carbs,
        protein: totals.protein + meal.protein,
        fat: totals.fat + meal.fat
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
  };

  const totals = calculateTotals();

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const addWaterGlass = () => {
    if (waterIntake < nutritionGoals.water) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const removeWaterGlass = () => {
    if (waterIntake > 0) {
      setWaterIntake(waterIntake - 1);
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      case 'snack': return 'apple';
      default: return 'restaurant';
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return '#F59E0B';
      case 'lunch': return '#10B981';
      case 'dinner': return '#8B5CF6';
      case 'snack': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const macroChartData = [
    {
      name: 'Carbs',
      population: totals.carbs * 4,
      color: '#3B82F6',
      legendFontColor: '#D1D5DB',
      legendFontSize: 12,
    },
    {
      name: 'Protein',
      population: totals.protein * 4,
      color: '#10B981',
      legendFontColor: '#D1D5DB',
      legendFontSize: 12,
    },
    {
      name: 'Fat',
      population: totals.fat * 9,
      color: '#F59E0B',
      legendFontColor: '#D1D5DB',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const MacroCard: React.FC<{
    title: string;
    current: number;
    goal: number;
    unit: string;
    color: string;
  }> = ({ title, current, goal, unit, color }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    
    return (
      <View style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroTitle}>{title}</Text>
          <Text style={[styles.macroPercentage, { color }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.macroProgressBar}>
          <View 
            style={[
              styles.macroProgressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={styles.macroValues}>
          {current}{unit} / {goal}{unit}
        </Text>
      </View>
    );
  };

  const MealCard: React.FC<{ meal: MealEntry }> = ({ meal }) => (
    <TouchableOpacity 
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: meal.id })}
    >
      <View style={styles.mealHeader}>
        <View style={[styles.mealIcon, { backgroundColor: getMealTypeColor(meal.type) }]}>
          <Ionicons name={getMealIcon(meal.type) as any} size={20} color="#fff" />
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
        <View style={styles.mealCalories}>
          <Text style={styles.mealCaloriesValue}>{meal.calories}</Text>
          <Text style={styles.mealCaloriesLabel}>cal</Text>
        </View>
      </View>
      <View style={styles.mealMacros}>
        <View style={styles.mealMacro}>
          <Text style={styles.mealMacroValue}>{meal.carbs}g</Text>
          <Text style={styles.mealMacroLabel}>Carbs</Text>
        </View>
        <View style={styles.mealMacro}>
          <Text style={styles.mealMacroValue}>{meal.protein}g</Text>
          <Text style={styles.mealMacroLabel}>Protein</Text>
        </View>
        <View style={styles.mealMacro}>
          <Text style={styles.mealMacroValue}>{meal.fat}g</Text>
          <Text style={styles.mealMacroLabel}>Fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FoodSearch')}>
          <Ionicons name="add-circle-outline" size={28} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Daily Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <LinearGradient 
          colors={['#1F2937', '#374151']} 
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totals.calories}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summaryGoal}>of {nutritionGoals.calories}</Text>
            </View>
            <View style={styles.summarySeparator} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {nutritionGoals.calories - totals.calories}
              </Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryGoal}>calories</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Macros Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={macroChartData}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Macro Breakdown */}
      <View style={styles.section}>
        <View style={styles.macroGrid}>
          <MacroCard
            title="Carbs"
            current={totals.carbs}
            goal={nutritionGoals.carbs}
            unit="g"
            color="#3B82F6"
          />
          <MacroCard
            title="Protein"
            current={totals.protein}
            goal={nutritionGoals.protein}
            unit="g"
            color="#10B981"
          />
          <MacroCard
            title="Fat"
            current={totals.fat}
            goal={nutritionGoals.fat}
            unit="g"
            color="#F59E0B"
          />
        </View>
      </View>

      {/* Water Intake */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Water Intake</Text>
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterInfo}>
              <Ionicons name="water" size={24} color="#06B6D4" />
              <Text style={styles.waterText}>
                {waterIntake} / {nutritionGoals.water} glasses
              </Text>
            </View>
            <View style={styles.waterControls}>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={removeWaterGlass}
                disabled={waterIntake === 0}
              >
                <Ionicons name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={addWaterGlass}
                disabled={waterIntake >= nutritionGoals.water}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.waterGlasses}>
            {Array.from({ length: nutritionGoals.water }, (_, index) => (
              <Ionicons
                key={index}
                name="water"
                size={24}
                color={index < waterIntake ? "#06B6D4" : "#374151"}
                style={styles.waterGlass}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Today's Meals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FoodSearch')}>
            <Text style={styles.addMealText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mealsContainer}>
          {todaysMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      </View>

      {/* Quick Add */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickAddContainer}>
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={() => navigation.navigate('FoodSearch')}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.quickAddGradient}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.quickAddText}>Scan Food</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={() => navigation.navigate('FoodSearch')}
          >
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.quickAddGradient}>
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.quickAddText}>Search Food</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  addMealText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 2,
  },
  summaryGoal: {
    fontSize: 12,
    color: '#6B7280',
  },
  summarySeparator: {
    width: 1,
    height: 40,
    backgroundColor: '#4B5563',
    marginHorizontal: 20,
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitle: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  macroPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  macroProgressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 8,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroValues: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  waterCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  waterControls: {
    flexDirection: 'row',
  },
  waterButton: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  waterGlass: {
    margin: 4,
  },
  mealsContainer: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  mealCalories: {
    alignItems: 'center',
  },
  mealCaloriesValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mealCaloriesLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  mealMacro: {
    alignItems: 'center',
  },
  mealMacroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  mealMacroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  quickAddContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  quickAddGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickAddText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomPadding: {
    height: 100,
  },
});

export default NutritionScreen;