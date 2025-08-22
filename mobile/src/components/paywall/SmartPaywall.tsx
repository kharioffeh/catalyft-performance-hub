import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { PAYWALL_MESSAGES, FEATURE_FLAGS } from '../../constants/subscriptions';
import FeatureGateService from '../../services/payments/featureFlags';
import { supabase } from '../../services/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SmartPaywallProps {
  feature?: string;
  triggerType?: 'feature_limit' | 'value_moment' | 'soft_paywall' | 'contextual';
  message?: string;
  onDismiss?: () => void;
  onUpgrade?: () => void;
}

interface PaywallTriggerConfig {
  id: string;
  type: string;
  condition: any;
  cooldownHours: number;
  maxImpressions: number;
  priority: number;
}

const triggerConfigs: PaywallTriggerConfig[] = [
  {
    id: 'first_workout_complete',
    type: 'value_moment',
    condition: { event: 'workout_completed', count: 1 },
    cooldownHours: 24,
    maxImpressions: 1,
    priority: 10,
  },
  {
    id: 'three_meals_logged',
    type: 'value_moment',
    condition: { event: 'meal_logged', count: 3 },
    cooldownHours: 48,
    maxImpressions: 2,
    priority: 8,
  },
  {
    id: 'seven_day_streak',
    type: 'value_moment',
    condition: { event: 'streak', days: 7 },
    cooldownHours: 72,
    maxImpressions: 1,
    priority: 9,
  },
  {
    id: 'weekly_workout_limit',
    type: 'feature_limit',
    condition: { feature: FEATURE_FLAGS.UNLIMITED_WORKOUTS },
    cooldownHours: 12,
    maxImpressions: 3,
    priority: 10,
  },
];

export const SmartPaywall: React.FC<SmartPaywallProps> = ({
  feature,
  triggerType = 'soft_paywall',
  message,
  onDismiss,
  onUpgrade,
}) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState(message || '');
  const [paywallTitle, setPaywallTitle] = useState('Unlock Premium');
  const [ctaText, setCtaText] = useState('Upgrade Now');
  const scale = useSharedValue(1);

  useEffect(() => {
    checkAndShowPaywall();
  }, [feature, triggerType]);

  const checkAndShowPaywall = async () => {
    // Check if user should see paywall
    const shouldShow = await shouldShowPaywall(feature, triggerType);
    
    if (shouldShow) {
      preparePaywallContent();
      setVisible(true);
      trackPaywallImpression();
    }
  };

  const shouldShowPaywall = async (
    feature?: string,
    triggerType?: string
  ): Promise<boolean> => {
    try {
      // Check if user already has premium
      const hasAccess = await FeatureGateService.checkAccess(feature || '');
      if (hasAccess.hasAccess) return false;

      // Check cooldown period
      const lastShown = await AsyncStorage.getItem(`paywall_last_shown_${feature}`);
      if (lastShown) {
        const hoursSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
        if (hoursSinceLastShown < 24) return false; // 24 hour cooldown
      }

      // Check impression count
      const impressions = await AsyncStorage.getItem(`paywall_impressions_${feature}`);
      if (impressions && parseInt(impressions) >= 5) return false; // Max 5 impressions

      // Don't show during active workout
      const activeWorkout = await AsyncStorage.getItem('active_workout');
      if (activeWorkout) return false;

      return true;
    } catch (error) {
      console.error('Error checking paywall conditions:', error);
      return false;
    }
  };

  const preparePaywallContent = () => {
    if (feature && PAYWALL_MESSAGES[feature as keyof typeof PAYWALL_MESSAGES]) {
      const config = PAYWALL_MESSAGES[feature as keyof typeof PAYWALL_MESSAGES];
      setPaywallTitle(config.title);
      setPaywallMessage(config.message);
      setCtaText(config.cta);
    } else if (message) {
      setPaywallMessage(message);
    } else {
      // Default message based on trigger type
      switch (triggerType) {
        case 'value_moment':
          setPaywallTitle('You\'re Making Great Progress! 🎉');
          setPaywallMessage('Take your fitness journey to the next level with Premium features');
          setCtaText('Continue with Premium');
          break;
        case 'feature_limit':
          setPaywallTitle('Limit Reached');
          setPaywallMessage('Upgrade to Premium for unlimited access');
          setCtaText('Remove Limits');
          break;
        default:
          setPaywallTitle('Unlock Premium Features');
          setPaywallMessage('Get the most out of Catalyft with a Premium subscription');
          setCtaText('View Plans');
      }
    }
  };

  const trackPaywallImpression = async () => {
    try {
      // Track impression in AsyncStorage
      const impressions = await AsyncStorage.getItem(`paywall_impressions_${feature}`);
      const newCount = impressions ? parseInt(impressions) + 1 : 1;
      await AsyncStorage.setItem(`paywall_impressions_${feature}`, newCount.toString());
      await AsyncStorage.setItem(`paywall_last_shown_${feature}`, Date.now().toString());

      // Track in analytics
      await supabase.from('analytics_events').insert({
        event_name: 'paywall_impression',
        event_properties: {
          feature,
          triggerType,
          message: paywallMessage,
        },
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking paywall impression:', error);
    }
  };

  const handleUpgrade = async () => {
    // Track conversion attempt
    await supabase.from('analytics_events').insert({
      event_name: 'paywall_upgrade_clicked',
      event_properties: {
        feature,
        triggerType,
      },
      created_at: new Date().toISOString(),
    });

    setVisible(false);
    
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigation.navigate('Paywall' as never);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  if (triggerType === 'soft_paywall') {
    // Soft paywall - shows inline without modal
    return (
      <Animated.View entering={FadeIn} style={styles.softPaywall}>
        <LinearGradient
          colors={['#7C3AED', '#9333EA']}
          style={styles.softPaywallGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.softPaywallContent}>
            <Ionicons name="lock-closed" size={24} color="white" />
            <Text style={styles.softPaywallText}>{paywallMessage}</Text>
            <TouchableOpacity
              style={styles.softPaywallButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.softPaywallButtonText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />
        
        <Animated.View 
          entering={SlideInUp.springify()}
          style={styles.modalContent}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#7C3AED', '#9333EA']}
              style={styles.iconGradient}
            >
              <Ionicons name="star" size={32} color="white" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{paywallTitle}</Text>
          <Text style={styles.message}>{paywallMessage}</Text>

          {triggerType === 'value_moment' && (
            <View style={styles.achievementContainer}>
              <View style={styles.achievementBadge}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.achievementText}>Achievement Unlocked!</Text>
              </View>
            </View>
          )}

          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
              onPressIn={() => (scale.value = 0.95)}
              onPressOut={() => (scale.value = 1)}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.upgradeButtonText}>{ctaText}</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={handleDismiss}>
            <Text style={styles.dismissText}>Maybe Later</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// HOC to wrap components with feature gates
export const withFeatureGate = (
  Component: React.ComponentType<any>,
  feature: string
) => {
  return (props: any) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);

    useEffect(() => {
      checkFeatureAccess();
    }, []);

    const checkFeatureAccess = async () => {
      const access = await FeatureGateService.checkAccess(feature);
      setHasAccess(access.hasAccess);
      if (!access.hasAccess) {
        setShowPaywall(true);
      }
    };

    if (hasAccess === null) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    }

    if (!hasAccess) {
      return (
        <SmartPaywall
          feature={feature}
          triggerType="feature_limit"
          onDismiss={() => setShowPaywall(false)}
        />
      );
    }

    return <Component {...props} />;
  };
};

// Paywall trigger manager
export class PaywallTriggerManager {
  private static instance: PaywallTriggerManager;
  private triggers: Map<string, PaywallTriggerConfig> = new Map();

  static getInstance(): PaywallTriggerManager {
    if (!PaywallTriggerManager.instance) {
      PaywallTriggerManager.instance = new PaywallTriggerManager();
    }
    return PaywallTriggerManager.instance;
  }

  async initialize() {
    // Load trigger configurations
    triggerConfigs.forEach(config => {
      this.triggers.set(config.id, config);
    });
  }

  async checkValueMomentTriggers(event: string, data?: any) {
    const relevantTriggers = Array.from(this.triggers.values()).filter(
      t => t.type === 'value_moment' && t.condition.event === event
    );

    for (const trigger of relevantTriggers) {
      const shouldTrigger = await this.evaluateTrigger(trigger, data);
      if (shouldTrigger) {
        this.showPaywall(trigger);
        break; // Only show one paywall at a time
      }
    }
  }

  private async evaluateTrigger(
    trigger: PaywallTriggerConfig,
    data?: any
  ): Promise<boolean> {
    // Check cooldown
    const lastShown = await AsyncStorage.getItem(`trigger_${trigger.id}_last_shown`);
    if (lastShown) {
      const hoursSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
      if (hoursSinceLastShown < trigger.cooldownHours) return false;
    }

    // Check max impressions
    const impressions = await AsyncStorage.getItem(`trigger_${trigger.id}_impressions`);
    if (impressions && parseInt(impressions) >= trigger.maxImpressions) return false;

    // Evaluate condition based on trigger type
    // This would be more complex in production
    return true;
  }

  private async showPaywall(trigger: PaywallTriggerConfig) {
    // Update tracking
    const impressions = await AsyncStorage.getItem(`trigger_${trigger.id}_impressions`);
    const newCount = impressions ? parseInt(impressions) + 1 : 1;
    await AsyncStorage.setItem(`trigger_${trigger.id}_impressions`, newCount.toString());
    await AsyncStorage.setItem(`trigger_${trigger.id}_last_shown`, Date.now().toString());

    // Show paywall (this would trigger a global paywall display)
    // Implementation depends on your navigation/state management
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  achievementContainer: {
    marginBottom: 20,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  achievementText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  dismissText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  softPaywall: {
    marginVertical: 15,
    marginHorizontal: 20,
  },
  softPaywallGradient: {
    borderRadius: 12,
    padding: 15,
  },
  softPaywallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  softPaywallText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginHorizontal: 12,
  },
  softPaywallButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  softPaywallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SmartPaywall;