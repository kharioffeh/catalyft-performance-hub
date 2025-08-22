import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useAuth } from '../../hooks/useAuth';
import { ariaService } from '../../services/ai/openai';
import { ProgressInsight, Prediction } from '../../types/ai';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const InsightsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const [insights, setInsights] = useState<ProgressInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'strength' | 'weight' | 'consistency'>('strength');
  
  // Mock data for charts
  const strengthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [100, 110, 115, 125, 130, 140],
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      strokeWidth: 2,
    }],
  };
  
  const bodyCompData = {
    labels: ['Weight', 'Body Fat', 'Muscle'],
    data: [0.75, 0.6, 0.85],
  };
  
  const consistencyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1, 1, 0, 1, 1, 1, 0],
    }],
  };
  
  useEffect(() => {
    loadInsights();
  }, []);
  
  const loadInsights = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const progressInsights = await ariaService.analyzeProgress(user.id);
      setInsights(progressInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'trending-up';
      case 'stable':
        return 'remove';
      case 'declining':
        return 'trending-down';
      default:
        return 'remove';
    }
  };
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '#34C759';
      case 'stable':
        return '#FFCC00';
      case 'declining':
        return '#FF3B30';
      default:
        return '#666';
    }
  };
  
  const renderStrengthProgress = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Strength Progress</Text>
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive,
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe && styles.timeframeTextActive,
                ]}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <LineChart
        data={strengthData}
        width={screenWidth - 40}
        height={200}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#667eea',
          },
        }}
        bezier
        style={styles.chart}
      />
      
      <View style={styles.chartFooter}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>+40%</Text>
          <Text style={styles.statLabel}>Total Gain</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>+5lbs</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>185lbs</Text>
          <Text style={styles.statLabel}>Current PR</Text>
        </View>
      </View>
    </View>
  );
  
  const renderBodyComposition = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Body Composition</Text>
      
      <ProgressChart
        data={bodyCompData}
        width={screenWidth - 40}
        height={220}
        strokeWidth={16}
        radius={32}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1, index) => {
            const colors = ['#667eea', '#FF6B6B', '#34C759'];
            return colors[index] || '#667eea';
          },
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        hideLegend={false}
        style={styles.chart}
      />
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#667eea' }]} />
          <Text style={styles.legendText}>Weight: 175 lbs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Body Fat: 15%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
          <Text style={styles.legendText}>Muscle: 42%</Text>
        </View>
      </View>
    </View>
  );
  
  const renderConsistency = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Consistency</Text>
      
      <BarChart
        data={consistencyData}
        width={screenWidth - 40}
        height={180}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.7,
        }}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
      />
      
      <View style={styles.consistencyStats}>
        <Text style={styles.consistencyScore}>71% Consistency Score</Text>
        <Text style={styles.consistencyMessage}>
          Great job! You've worked out 5 out of 7 days this week.
        </Text>
      </View>
    </View>
  );
  
  const renderPrediction = (prediction: Prediction) => (
    <View style={styles.predictionCard}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.predictionGradient}
      >
        <Icon name="analytics" size={24} color="#fff" />
        <View style={styles.predictionContent}>
          <Text style={styles.predictionTitle}>AI Prediction</Text>
          <Text style={styles.predictionMetric}>{prediction.metric}</Text>
          <View style={styles.predictionValues}>
            <View>
              <Text style={styles.predictionLabel}>Current</Text>
              <Text style={styles.predictionValue}>{prediction.current}</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#fff" />
            <View>
              <Text style={styles.predictionLabel}>Predicted</Text>
              <Text style={styles.predictionValue}>{prediction.predicted}</Text>
            </View>
          </View>
          <Text style={styles.predictionTimeframe}>
            In {prediction.timeframe} • {Math.round(prediction.confidence * 100)}% confidence
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
  
  const renderInsightCard = (insight: ProgressInsight) => (
    <TouchableOpacity key={insight.id} style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <View style={styles.insightIconContainer}>
          <Icon
            name={getTrendIcon(insight.trend)}
            size={24}
            color={getTrendColor(insight.trend)}
          />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
        </View>
      </View>
      
      {insight.prediction && renderPrediction(insight.prediction)}
      
      {insight.recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
          {insight.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Icon name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
  
  const renderAchievements = () => (
    <View style={styles.achievementsCard}>
      <Text style={styles.sectionTitle}>Recent Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { icon: 'trophy', title: 'PR Breaker', desc: 'New Bench PR!' },
          { icon: 'flame', title: '30 Day Streak', desc: 'Consistency King' },
          { icon: 'nutrition', title: 'Macro Master', desc: 'Perfect Week' },
          { icon: 'trending-up', title: 'Gain Train', desc: '+10lbs Total' },
        ].map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <LinearGradient
              colors={['#FFD93D', '#FFB800']}
              style={styles.achievementIcon}
            >
              <Icon name={achievement.icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDesc}>{achievement.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Analyzing your progress...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Progress Insights</Text>
            <Text style={styles.headerSubtitle}>
              AI-powered analysis of your fitness journey
            </Text>
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <Icon name="chatbubble-ellipses" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Icon name="trending-up" size={20} color="#34C759" />
            <Text style={styles.quickStatValue}>+12%</Text>
            <Text style={styles.quickStatLabel}>This Month</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Icon name="fitness" size={20} color="#007AFF" />
            <Text style={styles.quickStatValue}>23</Text>
            <Text style={styles.quickStatLabel}>Workouts</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Icon name="flame" size={20} color="#FF3B30" />
            <Text style={styles.quickStatValue}>15</Text>
            <Text style={styles.quickStatLabel}>Day Streak</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Icon name="star" size={20} color="#FFCC00" />
            <Text style={styles.quickStatValue}>8.5</Text>
            <Text style={styles.quickStatLabel}>Avg Score</Text>
          </View>
        </View>
        
        {/* Charts */}
        {renderStrengthProgress()}
        {renderBodyComposition()}
        {renderConsistency()}
        
        {/* Achievements */}
        {renderAchievements()}
        
        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {insights.map(renderInsightCard)}
        </View>
        
        {/* Action Button */}
        <TouchableOpacity style={styles.coachButton}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.coachButtonGradient}
          >
            <Icon name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.coachButtonText}>Talk to ARIA About Progress</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  chatButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: '#fff',
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
  },
  timeframeTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  consistencyStats: {
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  consistencyScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  consistencyMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  achievementsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  insightsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  predictionCard: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  predictionGradient: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  predictionContent: {
    flex: 1,
    marginLeft: 12,
  },
  predictionTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  predictionMetric: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  predictionValues: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  predictionLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  predictionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  predictionTimeframe: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  recommendationsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  coachButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  coachButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  coachButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default InsightsDashboard;