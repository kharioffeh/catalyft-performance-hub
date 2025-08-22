import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription, SubscriptionStatus } from '../../types/payments';
import FeatureGateService from './featureFlags';
import { Alert } from 'react-native';

interface WebhookEvent {
  type: string;
  data: any;
  created: number;
}

interface SubscriptionUpdate {
  subscriptionId: string;
  status: SubscriptionStatus;
  tier?: 'Free' | 'Premium' | 'Elite';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: Date;
}

class WebhookListener {
  private static instance: WebhookListener;
  private subscription: any = null;
  private userId: string | null = null;
  private isListening = false;

  private constructor() {}

  static getInstance(): WebhookListener {
    if (!WebhookListener.instance) {
      WebhookListener.instance = new WebhookListener();
    }
    return WebhookListener.instance;
  }

  // Initialize webhook listener for real-time subscription updates
  async initialize(userId: string): Promise<void> {
    if (this.isListening) return;

    this.userId = userId;
    this.isListening = true;

    // Subscribe to subscription changes
    this.subscribeToSubscriptionChanges();
    
    // Subscribe to payment events
    this.subscribeToPaymentEvents();
    
    // Subscribe to usage events
    this.subscribeToUsageEvents();
  }

  // Subscribe to real-time subscription changes
  private subscribeToSubscriptionChanges(): void {
    this.subscription = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          this.handleSubscriptionChange(payload);
        }
      )
      .subscribe();
  }

  // Subscribe to payment events
  private subscribeToPaymentEvents(): void {
    supabase
      .channel('payment-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          this.handlePaymentEvent(payload);
        }
      )
      .subscribe();
  }

  // Subscribe to usage limit events
  private subscribeToUsageEvents(): void {
    supabase
      .channel('usage-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_limits',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          this.handleUsageEvent(payload);
        }
      )
      .subscribe();
  }

  // Handle subscription status changes
  private async handleSubscriptionChange(payload: any): Promise<void> {
    console.log('Subscription changed:', payload);
    
    const subscription = payload.new as Subscription;
    const oldSubscription = payload.old as Subscription;
    
    switch (subscription.status) {
      case 'active':
        await this.handleSubscriptionActivated(subscription, oldSubscription);
        break;
      case 'trialing':
        await this.handleTrialStarted(subscription);
        break;
      case 'past_due':
        await this.handlePaymentFailed(subscription);
        break;
      case 'canceled':
        await this.handleSubscriptionCanceled(subscription);
        break;
      case 'paused':
        await this.handleSubscriptionPaused(subscription);
        break;
      case 'incomplete':
        await this.handleIncompletePayment(subscription);
        break;
      default:
        console.log('Unknown subscription status:', subscription.status);
    }

    // Clear feature cache to refresh permissions
    await FeatureGateService.clearCache();
    
    // Notify UI of subscription change
    await this.notifyUI('subscription_updated', subscription);
  }

  // Handle subscription activation
  private async handleSubscriptionActivated(
    subscription: Subscription,
    oldSubscription?: Subscription
  ): Promise<void> {
    const isUpgrade = oldSubscription && 
      this.getTierLevel(subscription.tier) > this.getTierLevel(oldSubscription.tier);
    
    const isNewSubscription = !oldSubscription || oldSubscription.status !== 'active';

    if (isNewSubscription) {
      // New subscription or trial conversion
      await this.showSuccessNotification(
        'Welcome to Premium! 🎉',
        'All premium features are now unlocked. Enjoy your fitness journey!'
      );
      
      // Track conversion
      await this.trackEvent('subscription_activated', {
        tier: subscription.tier,
        wasTrialing: oldSubscription?.status === 'trialing',
      });
      
      // Send welcome email (via Supabase function)
      await this.sendWelcomeEmail(subscription);
    } else if (isUpgrade) {
      // Upgrade
      await this.showSuccessNotification(
        'Upgrade Successful! 🚀',
        `You're now on the ${subscription.tier} plan with even more features!`
      );
      
      await this.trackEvent('subscription_upgraded', {
        fromTier: oldSubscription.tier,
        toTier: subscription.tier,
      });
    }

    // Unlock premium features immediately
    await this.unlockPremiumFeatures(subscription.tier);
  }

  // Handle trial start
  private async handleTrialStarted(subscription: Subscription): Promise<void> {
    const trialDays = subscription.trialEnd ? 
      Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
    
    await this.showSuccessNotification(
      'Free Trial Started! 🎁',
      `Enjoy ${trialDays} days of ${subscription.tier} features absolutely free!`
    );
    
    // Schedule trial ending reminder
    await this.scheduleTrialReminder(subscription);
    
    await this.trackEvent('trial_started', {
      tier: subscription.tier,
      trialDays,
    });
  }

  // Handle payment failure
  private async handlePaymentFailed(subscription: Subscription): Promise<void> {
    await this.showWarningNotification(
      'Payment Failed',
      'Please update your payment method to continue enjoying premium features.'
    );
    
    // Give grace period before locking features
    await this.scheduleGracePeriodEnd(subscription);
    
    await this.trackEvent('payment_failed', {
      tier: subscription.tier,
    });
  }

  // Handle subscription cancellation
  private async handleSubscriptionCanceled(subscription: Subscription): Promise<void> {
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      // Subscription will end at period end
      const endDate = new Date(subscription.currentPeriodEnd);
      await this.showInfoNotification(
        'Subscription Canceled',
        `You'll continue to have access until ${endDate.toLocaleDateString()}`
      );
      
      // Schedule win-back campaign
      await this.scheduleWinBackCampaign(subscription);
    } else {
      // Immediate cancellation
      await this.lockPremiumFeatures();
      await this.showInfoNotification(
        'Subscription Ended',
        'Your premium features have been disabled. We hope to see you back soon!'
      );
    }
    
    await this.trackEvent('subscription_canceled', {
      tier: subscription.tier,
      reason: await AsyncStorage.getItem('cancel_reason'),
    });
  }

  // Handle subscription pause
  private async handleSubscriptionPaused(subscription: Subscription): Promise<void> {
    await this.showInfoNotification(
      'Subscription Paused',
      'Your subscription is paused. You can resume anytime from settings.'
    );
    
    await this.trackEvent('subscription_paused', {
      tier: subscription.tier,
    });
  }

  // Handle incomplete payment
  private async handleIncompletePayment(subscription: Subscription): Promise<void> {
    await this.showWarningNotification(
      'Payment Required',
      'Please complete your payment to activate premium features.'
    );
    
    await this.trackEvent('payment_incomplete', {
      tier: subscription.tier,
    });
  }

  // Handle payment events
  private async handlePaymentEvent(payload: any): Promise<void> {
    const payment = payload.new;
    
    if (payment.status === 'succeeded') {
      await this.trackEvent('payment_succeeded', {
        amount: payment.amount,
        currency: payment.currency,
      });
      
      // Update local payment history cache
      await this.updatePaymentCache(payment);
    } else if (payment.status === 'failed') {
      await this.showWarningNotification(
        'Payment Failed',
        'We couldn\'t process your payment. Please check your payment method.'
      );
    }
  }

  // Handle usage limit events
  private async handleUsageEvent(payload: any): Promise<void> {
    const usage = payload.new;
    
    // Check if user is approaching limits
    if (usage.workouts_this_week >= usage.workout_limit - 1) {
      await this.showInfoNotification(
        'Approaching Workout Limit',
        'You have 1 workout remaining this week. Upgrade for unlimited workouts!'
      );
    }
    
    if (usage.ai_chats_today >= usage.ai_chat_limit) {
      await this.showInfoNotification(
        'AI Chat Limit Reached',
        'You\'ve used all your AI chats for today. Upgrade for unlimited access!'
      );
    }
  }

  // Unlock premium features
  private async unlockPremiumFeatures(tier: 'Free' | 'Premium' | 'Elite'): Promise<void> {
    await AsyncStorage.setItem('subscription_tier', tier);
    await FeatureGateService.clearCache();
    
    // Notify all screens to refresh
    await this.notifyUI('features_unlocked', { tier });
  }

  // Lock premium features
  private async lockPremiumFeatures(): Promise<void> {
    await AsyncStorage.setItem('subscription_tier', 'Free');
    await FeatureGateService.clearCache();
    
    // Notify all screens to refresh
    await this.notifyUI('features_locked', {});
  }

  // Schedule trial reminder
  private async scheduleTrialReminder(subscription: Subscription): Promise<void> {
    if (!subscription.trialEnd) return;
    
    // Schedule notifications 3 days and 1 day before trial ends
    const trialEnd = new Date(subscription.trialEnd);
    const threeDaysBefore = new Date(trialEnd.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneDayBefore = new Date(trialEnd.getTime() - 24 * 60 * 60 * 1000);
    
    // Store reminder schedule
    await AsyncStorage.setItem('trial_reminders', JSON.stringify({
      threeDayReminder: threeDaysBefore.toISOString(),
      oneDayReminder: oneDayBefore.toISOString(),
      trialEnd: trialEnd.toISOString(),
    }));
  }

  // Schedule grace period end
  private async scheduleGracePeriodEnd(subscription: Subscription): Promise<void> {
    // Give 3 days grace period
    const gracePeriodEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    await AsyncStorage.setItem('grace_period_end', gracePeriodEnd.toISOString());
  }

  // Schedule win-back campaign
  private async scheduleWinBackCampaign(subscription: Subscription): Promise<void> {
    // Schedule win-back emails/notifications
    const campaigns = [
      { days: 3, discount: 20 },
      { days: 7, discount: 30 },
      { days: 30, discount: 50 },
    ];
    
    await AsyncStorage.setItem('winback_campaigns', JSON.stringify(campaigns));
  }

  // Send welcome email
  private async sendWelcomeEmail(subscription: Subscription): Promise<void> {
    await supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        userId: this.userId,
        tier: subscription.tier,
      },
    });
  }

  // Update payment cache
  private async updatePaymentCache(payment: any): Promise<void> {
    const cachedPayments = await AsyncStorage.getItem('payment_history');
    const payments = cachedPayments ? JSON.parse(cachedPayments) : [];
    payments.unshift(payment);
    await AsyncStorage.setItem('payment_history', JSON.stringify(payments.slice(0, 10)));
  }

  // Show notifications
  private async showSuccessNotification(title: string, message: string): Promise<void> {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  private async showWarningNotification(title: string, message: string): Promise<void> {
    Alert.alert(title, message, [
      { text: 'Update Payment', onPress: () => this.navigateToPaymentUpdate() },
      { text: 'Later', style: 'cancel' },
    ]);
  }

  private async showInfoNotification(title: string, message: string): Promise<void> {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  // Navigate to payment update
  private navigateToPaymentUpdate(): void {
    // This would navigate to payment update screen
    // Implementation depends on your navigation setup
  }

  // Notify UI of changes
  private async notifyUI(event: string, data: any): Promise<void> {
    // This would emit an event that UI components can listen to
    // Implementation depends on your state management solution
    await AsyncStorage.setItem('last_subscription_event', JSON.stringify({
      event,
      data,
      timestamp: Date.now(),
    }));
  }

  // Track analytics events
  private async trackEvent(eventName: string, properties: any): Promise<void> {
    await supabase.from('analytics_events').insert({
      user_id: this.userId,
      event_name: eventName,
      event_properties: properties,
      created_at: new Date().toISOString(),
    });
  }

  // Get tier level for comparison
  private getTierLevel(tier: string): number {
    const levels: Record<string, number> = {
      'Free': 0,
      'Premium': 1,
      'Elite': 2,
    };
    return levels[tier] || 0;
  }

  // Clean up subscriptions
  async cleanup(): Promise<void> {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.isListening = false;
  }
}

export default WebhookListener.getInstance();