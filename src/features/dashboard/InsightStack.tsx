import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeckSwiper from 'react-native-deck-swiper';
import { motion } from 'framer-motion';
import { useInsights, Insight } from '@/hooks/useInsights';
import { saveInsight } from '@catalyft/core/api';
import { Brain, Target, TrendingUp, Moon, Activity, Dumbbell, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'readiness':
      return Activity;
    case 'sleep':
      return Moon;
    case 'load':
      return Dumbbell;
    case 'stress':
      return Brain;
    case 'general':
      return Target;
    default:
      return TrendingUp;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'red':
      return 'hsl(var(--destructive))';
    case 'amber':
      return 'hsl(var(--warning))';
    case 'green':
      return 'hsl(var(--success))';
    default:
      return 'hsl(var(--primary))';
  }
};

interface InsightCardProps {
  insight: Insight;
}

const InsightStackCard: React.FC<InsightCardProps> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight.type);
  const backgroundColor = getSeverityColor(insight.severity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-6 h-80 w-72 shadow-lg"
      style={{ backgroundColor: `${backgroundColor}10` }}
      role="region"
      aria-labelledby={`insight-${insight.id}-title`}
      aria-describedby={`insight-${insight.id}-body`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor }}
        >
          <IconComponent 
            size={24} 
            className="text-white"
          />
        </div>
        <div className="flex-1">
          <h3 
            id={`insight-${insight.id}-title`}
            className="text-lg font-semibold text-foreground"
          >
            {insight.title}
          </h3>
          {insight.value && (
            <p className="text-sm text-muted-foreground">
              Score: {Math.round(insight.value)}
            </p>
          )}
        </div>
      </div>
      
      <p 
        id={`insight-${insight.id}-body`}
        className="text-sm text-muted-foreground leading-relaxed"
      >
        {insight.message}
      </p>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Swipe ← dismiss • Swipe → save
        </div>
        {insight.trend && (
          <div className="flex items-center gap-1">
            <TrendingUp 
              size={16} 
              className={`${
                insight.trend === 'up' ? 'text-success rotate-0' :
                insight.trend === 'down' ? 'text-destructive rotate-180' :
                'text-muted-foreground rotate-90'
              }`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const InsightStack: React.FC = () => {
  const allInsights = useInsights();
  const [insights, setInsights] = useState<Insight[]>(allInsights);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  // Update local state when insights change
  React.useEffect(() => {
    setInsights(allInsights);
    setCurrentIndex(0);
  }, [allInsights]);

  const handleSwipeLeft = (cardIndex: number) => {
    // Just dismiss the card locally
    console.log('Dismissed insight:', insights[cardIndex]?.id);
  };

  const handleSwipeRight = async (cardIndex: number) => {
    const insight = insights[cardIndex];
    if (!insight) return;

    try {
      await saveInsight(insight.id);
      toast.success('Insight saved!');
      console.log('Saved insight:', insight.id);
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast.error('Failed to save insight');
      // Reset the card position on error
      if (swiperRef.current) {
        swiperRef.current.jumpToCardIndex(cardIndex);
      }
    }
  };

  const handleSwipedAll = () => {
    console.log('All insights swiped');
  };

  if (!insights || insights.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text 
          style={styles.emptyTitle}
          accessibilityRole="text"
          accessibilityLabel="No insights available"
        >
          No insights – great job! 🎉
        </Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new insights
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DeckSwiper
        ref={swiperRef}
        cards={insights}
        cardIndex={currentIndex}
        renderCard={(insight: Insight) => (
          <InsightStackCard insight={insight} />
        )}
        onSwipedLeft={handleSwipeLeft}
        onSwipedRight={handleSwipeRight}
        onSwipedAll={handleSwipedAll}
        onSwiped={(cardIndex) => {
          setCurrentIndex(cardIndex + 1);
        }}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={15}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        overlayLabels={{
          left: {
            title: 'DISMISS',
            style: {
              label: {
                backgroundColor: '#ef4444',
                borderColor: '#ef4444',
                color: 'white',
                borderWidth: 1
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30
              }
            }
          },
          right: {
            title: 'SAVE',
            style: {
              label: {
                backgroundColor: '#22c55e',
                borderColor: '#22c55e',
                color: 'white',
                borderWidth: 1
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30
              }
            }
          }
        }}
      />
      
      {insights.length > 1 && (
        <Text style={styles.counter}>
          {currentIndex + 1} of {insights.length} insights
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
  },
  counter: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 16,
  },
});