import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Circle, Rect, Line, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface NutritionStatsData {
  calorieIntake: {
    day: string;
    consumed: number;
    target: number;
    burned: number;
  }[];
  macronutrients: {
    protein: { current: number; target: number; color: string };
    carbs: { current: number; target: number; color: string };
    fats: { current: number; target: number; color: string };
  };
  micronutrients: {
    vitamin: string;
    current: number;
    target: number;
    unit: string;
    status: 'excellent' | 'good' | 'deficient';
  }[];
  mealTiming: {
    meal: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }[];
  hydration: {
    day: string;
    water: number;
    target: number;
    other: number;
  }[];
  nutritionScore: {
    overall: number;
    categories: {
      category: string;
      score: number;
      color: string;
    }[];
  };
}

const NutritionStatsScreen: React.FC = () => {
  const [data, setData] = useState<NutritionStatsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchNutritionStatsData();
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const fetchNutritionStatsData = async () => {
    setRefreshing(true);
    
    // Mock data for premium nutrition statistics analytics
    setTimeout(() => {
      setData({
        calorieIntake: [
          { day: 'Mon', consumed: 1850, target: 2000, burned: 450 },
          { day: 'Tue', consumed: 1950, target: 2000, burned: 520 },
          { day: 'Wed', consumed: 2100, target: 2000, burned: 480 },
          { day: 'Thu', consumed: 1800, target: 2000, burned: 390 },
          { day: 'Fri', consumed: 2200, target: 2000, burned: 550 },
          { day: 'Sat', consumed: 1900, target: 2000, burned: 420 },
          { day: 'Sun', consumed: 1750, target: 2000, burned: 380 },
        ],
        macronutrients: {
          protein: { current: 180, target: 200, color: '#EF4444' },
          carbs: { current: 220, target: 250, color: '#22C55E' },
          fats: { current: 65, target: 70, color: '#F59E0B' },
        },
        micronutrients: [
          { vitamin: 'Vitamin D', current: 25, target: 30, unit: 'mcg', status: 'good' },
          { vitamin: 'Iron', current: 18, target: 18, unit: 'mg', status: 'excellent' },
          { vitamin: 'Calcium', current: 950, target: 1000, unit: 'mg', status: 'good' },
          { vitamin: 'B12', current: 2.8, target: 2.4, unit: 'mcg', status: 'excellent' },
          { vitamin: 'Omega-3', current: 1.2, target: 1.6, unit: 'g', status: 'deficient' },
        ],
        mealTiming: [
          { meal: 'Breakfast', time: '7:30 AM', calories: 450, protein: 25, carbs: 45, fats: 18 },
          { meal: 'Lunch', time: '12:30 PM', calories: 650, protein: 35, carbs: 65, fats: 22 },
          { meal: 'Dinner', time: '7:00 PM', calories: 550, protein: 30, carbs: 55, fats: 20 },
          { meal: 'Snacks', time: '3:00 PM', calories: 200, protein: 10, carbs: 20, fats: 8 },
        ],
        hydration: [
          { day: 'Mon', water: 2.5, target: 3.0, other: 0.5 },
          { day: 'Tue', water: 2.8, target: 3.0, other: 0.6 },
          { day: 'Wed', water: 3.2, target: 3.0, other: 0.4 },
          { day: 'Thu', water: 2.6, target: 3.0, other: 0.7 },
          { day: 'Fri', water: 3.0, target: 3.0, other: 0.5 },
          { day: 'Sat', water: 2.7, target: 3.0, other: 0.8 },
          { day: 'Sun', water: 2.9, target: 3.0, other: 0.6 },
        ],
        nutritionScore: {
          overall: 87,
          categories: [
            { category: 'Protein', score: 90, color: '#EF4444' },
            { category: 'Carbs', score: 88, color: '#22C55E' },
            { category: 'Fats', score: 93, color: '#F59E0B' },
            { category: 'Vitamins', score: 85, color: '#3B82F6' },
            { category: 'Minerals', score: 82, color: '#8B5CF6' },
          ],
        },
      });
      setRefreshing(false);
    }, 1000);
  };

  const renderCalorieBalanceChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Daily Calorie Balance</Text>
      <View style={styles.calorieChart}>
        <Svg width={width - 80} height={250}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 35}
              x2={width - 80}
              y2={50 + i * 35}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
          {/* Target line */}
          <Line
            x1={0}
            y1={50}
            x2={width - 80}
            y2={50}
            stroke="#EAB308"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          
          {/* Consumed bars */}
          {data?.calorieIntake.map((day, index) => (
            <React.Fragment key={index}>
              <Rect
                x={20 + index * 40}
                y={50 - (day.consumed / 2500) * 120}
                width={25}
                height={(day.consumed / 2500) * 120}
                fill="#6C63FF"
                rx={4}
              />
              
              {/* Burned bars */}
              <Rect
                x={20 + index * 40}
                y={50 + 20}
                width={25}
                height={(day.burned / 600) * 80}
                fill="#22C55E"
                rx={4}
              />
              
              {/* Day label */}
              <SvgText
                x={32.5 + index * 40}
                y={220}
                fontSize={10}
                textAnchor="middle"
                fill="#666"
              >
                {day.day}
              </SvgText>
              
              {/* Net calories */}
              <SvgText
                x={32.5 + index * 40}
                y={235}
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {day.consumed - day.burned}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
        
        <View style={styles.calorieLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#6C63FF' }]} />
            <Text style={styles.legendText}>Consumed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Burned</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMacronutrientsChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Macronutrient Balance</Text>
      <View style={styles.macroChart}>
        <Svg width={200} height={200}>
          {/* Background circle */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke="#E5E7EB"
            strokeWidth={20}
            fill="transparent"
          />
          
          {/* Protein */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke={data?.macronutrients.protein.color || '#EF4444'}
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.macronutrients.protein.current || 0) / (data?.macronutrients.protein.target || 1) * 503} 503`}
            strokeDashoffset={503}
            transform={`rotate(-90 100 100)`}
          />
          
          {/* Carbs */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke={data?.macronutrients.carbs.color || '#22C55E'}
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.macronutrients.carbs.current || 0) / (data?.macronutrients.carbs.target || 1) * 503} 503`}
            strokeDashoffset={503 - (data?.macronutrients.protein.current || 0) / (data?.macronutrients.protein.target || 1) * 503}
            transform={`rotate(-90 100 100)`}
          />
          
          {/* Fats */}
          <Circle
            cx={100}
            cy={100}
            r={80}
            stroke={data?.macronutrients.fats.color || '#F59E0B'}
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={`${(data?.macronutrients.fats.current || 0) / (data?.macronutrients.fats.target || 1) * 503} 503`}
            strokeDashoffset={503 - ((data?.macronutrients.protein.current || 0) / (data?.macronutrients.protein.target || 1) + (data?.macronutrients.carbs.current || 0) / (data?.macronutrients.carbs.target || 1)) * 503}
            transform={`rotate(-90 100 100)`}
          />
        </Svg>
        
        <View style={styles.macroLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data?.macronutrients.protein.color || '#EF4444' }]} />
            <Text style={styles.legendText}>
              Protein: {data?.macronutrients.protein.current}g / {data?.macronutrients.protein.target}g
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data?.macronutrients.carbs.color || '#22C55E' }]} />
            <Text style={styles.legendText}>
              Carbs: {data?.macronutrients.carbs.current}g / {data?.macronutrients.carbs.target}g
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: data?.macronutrients.fats.color || '#F59E0B' }]} />
            <Text style={styles.legendText}>
              Fats: {data?.macronutrients.fats.current}g / {data?.macronutrients.fats.target}g
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderMicronutrientsChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Micronutrient Status</Text>
      <View style={styles.microChart}>
        {data?.micronutrients.map((vitamin, index) => (
          <View key={index} style={styles.microRow}>
            <View style={styles.microInfo}>
              <Text style={styles.microName}>{vitamin.vitamin}</Text>
              <Text style={styles.microTarget}>
                Target: {vitamin.target}{vitamin.unit}
              </Text>
            </View>
            <View style={styles.microProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((vitamin.current / vitamin.target) * 100, 100)}%`,
                      backgroundColor: getStatusColor(vitamin.status),
                    },
                  ]}
                />
              </View>
              <Text style={styles.microValue}>
                {vitamin.current}{vitamin.unit}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vitamin.status) }]}>
              <Text style={styles.statusText}>{vitamin.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMealTimingChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Meal Timing & Composition</Text>
      <View style={styles.mealChart}>
        {data?.mealTiming.map((meal, index) => (
          <LinearGradient
            key={index}
            colors={['#6C63FF', '#4ECDC4']}
            style={styles.mealCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{meal.meal}</Text>
              <Text style={styles.mealTime}>{meal.time}</Text>
            </View>
            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            <View style={styles.macroBreakdown}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>P</Text>
                <Text style={styles.macroValue}>{meal.protein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>C</Text>
                <Text style={styles.macroValue}>{meal.carbs}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>F</Text>
                <Text style={styles.macroValue}>{meal.fats}g</Text>
              </View>
            </View>
          </LinearGradient>
        ))}
      </View>
    </View>
  );

  const renderHydrationChart = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Hydration Tracking</Text>
      <View style={styles.hydrationChart}>
        <Svg width={width - 80} height={200}>
          {/* Background grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Line
              key={i}
              x1={0}
              y1={50 + i * 30}
              x2={width - 80}
              y2={50 + i * 30}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
          ))}
          
          {/* Target line */}
          <Line
            x1={0}
            y1={50}
            x2={width - 80}
            y2={50}
            stroke="#EAB308"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          
          {/* Water bars */}
          {data?.hydration.map((day, index) => (
            <React.Fragment key={index}>
              <Rect
                x={20 + index * 40}
                y={50 - (day.water / 4) * 100}
                width={25}
                height={(day.water / 4) * 100}
                fill="#3B82F6"
                rx={4}
              />
              
              {/* Other fluids */}
              <Rect
                x={20 + index * 40}
                y={50 + 20}
                width={25}
                height={(day.other / 4) * 80}
                fill="#8B5CF6"
                rx={4}
              />
              
              {/* Day label */}
              <SvgText
                x={32.5 + index * 40}
                y={190}
                fontSize={10}
                textAnchor="middle"
                fill="#666"
              >
                {day.day}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
        
        <View style={styles.hydrationLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Water</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Other Fluids</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNutritionScore = () => (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Nutrition Score</Text>
      <View style={styles.scoreContainer}>
        <Animated.View
          style={[
            styles.overallScore,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={120} height={120}>
            <Circle
              cx={60}
              cy={60}
              r={50}
              stroke="#E5E7EB"
              strokeWidth={8}
              fill="transparent"
            />
            <Circle
              cx={60}
              cy={60}
              r={50}
              stroke="#22C55E"
              strokeWidth={8}
              fill="transparent"
              strokeDasharray={`${(data?.nutritionScore.overall || 0) * 3.14} 314`}
              strokeDashoffset={314}
              transform={`rotate(-90 60 60)`}
            />
          </Svg>
          <Text style={styles.scoreValue}>{data?.nutritionScore.overall}</Text>
        </Animated.View>
        
        <View style={styles.categoryScores}>
          {data?.nutritionScore.categories.map((category, index) => (
            <View key={index} style={styles.categoryScore}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${category.score}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
                <Text style={styles.categoryValue}>{category.score}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#22C55E';
      case 'good':
        return '#3B82F6';
      case 'deficient':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchNutritionStatsData} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={styles.header}>
        <Text style={styles.title}>Nutrition Statistics</Text>
        <Text style={styles.subtitle}>Track your nutritional progress</Text>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {renderCalorieBalanceChart()}
      {renderMacronutrientsChart()}
      {renderMicronutrientsChart()}
      {renderMealTimingChart()}
      {renderHydrationChart()}
      {renderNutritionScore()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  periodButtonActive: {
    backgroundColor: '#6C63FF',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: 'white',
  },
  chartSection: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  calorieChart: {
    alignItems: 'center',
  },
  calorieLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  macroChart: {
    alignItems: 'center',
  },
  macroLegend: {
    marginTop: 20,
    width: '100%',
  },
  microChart: {
    width: '100%',
  },
  microRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  microInfo: {
    flex: 1,
  },
  microName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  microTarget: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  microProgress: {
    flex: 1,
    marginHorizontal: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  microValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mealChart: {
    gap: 15,
  },
  mealCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  mealTime: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  mealCalories: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  macroBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  hydrationChart: {
    alignItems: 'center',
  },
  hydrationLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  overallScore: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreValue: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryScores: {
    width: '100%',
  },
  categoryScore: {
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  categoryBar: {
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
  },
  categoryValue: {
    position: 'absolute',
    right: 10,
    top: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default NutritionStatsScreen;