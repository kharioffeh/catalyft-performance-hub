import { StripeProvider, useStripe, initStripe, presentPaymentSheet, initPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SubscriptionTier, 
  Subscription, 
  Payment, 
  PaymentMethod,
  CheckoutSession,
  SubscriptionStatus,
  Invoice,
  PromoCode 
} from '../../types/payments';
import { SUBSCRIPTION_PLANS } from '../../constants/subscriptions';
import { Platform } from 'react-native';

class StripePaymentService {
  private static instance: StripePaymentService;
  private publishableKey: string | null = null;
  private initialized = false;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): StripePaymentService {
    if (!StripePaymentService.instance) {
      StripePaymentService.instance = new StripePaymentService();
    }
    return StripePaymentService.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.initialized) return;

    try {
      this.userId = userId;
      
      // Get Stripe publishable key from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-stripe-config', {
        body: { userId }
      });

      if (error) throw error;

      this.publishableKey = data.publishableKey;

      // Initialize Stripe
      await initStripe({
        publishableKey: this.publishableKey,
        merchantIdentifier: 'merchant.com.catalyft',
        urlScheme: 'catalyft',
        setReturnUrlSchemeOnAndroid: true,
      });

      this.initialized = true;
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      throw error;
    }
  }

  // Create a checkout session for web-based payments
  async createCheckoutSession(
    priceId: string,
    promoCode?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: this.userId,
          promoCode,
          successUrl: 'catalyft://subscription-success',
          cancelUrl: 'catalyft://subscription-cancel',
          metadata: {
            platform: Platform.OS,
            appVersion: '1.0.0',
          }
        },
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  // Present native payment sheet for in-app purchases
  async presentPaymentSheet(
    priceId: string,
    promoCode?: string
  ): Promise<boolean> {
    try {
      // Create payment intent via Supabase
      const { data, error: intentError } = await supabase.functions.invoke('create-payment-intent', {
        body: { 
          priceId,
          userId: this.userId,
          promoCode,
        }
      });

      if (intentError) throw intentError;

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Catalyft',
        paymentIntentClientSecret: data.clientSecret,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customerId,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          email: data.email,
          name: data.name,
        },
        returnURL: 'catalyft://payment-complete',
        applePay: {
          merchantCountryCode: 'US',
        },
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: __DEV__,
        },
      });

      if (initError) {
        console.error('Payment sheet init error:', initError);
        return false;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Payment sheet present error:', presentError);
        return false;
      }

      // Payment successful
      await this.onPaymentSuccess(priceId);
      return true;
    } catch (error) {
      console.error('Payment sheet error:', error);
      return false;
    }
  }

  // Subscribe to a plan
  async subscribeToPlan(
    priceId: string,
    paymentMethodId?: string,
    promoCode?: string
  ): Promise<Subscription> {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          priceId,
          paymentMethodId,
          userId: this.userId,
          promoCode,
          trialFromPlan: true,
        },
      });

      if (error) throw error;

      // Update local subscription state
      await this.updateLocalSubscription(data.subscription);
      
      // Track conversion
      await this.trackSubscriptionEvent('subscription_created', {
        tier: data.subscription.tier,
        priceId,
        hasPromo: !!promoCode,
      });

      return data.subscription;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(
    reason?: string,
    feedback?: string
  ): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus();
      if (!subscription?.stripeSubscriptionId) return false;

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { 
          subscriptionId: subscription.stripeSubscriptionId,
          reason,
          feedback,
          userId: this.userId,
        }
      });

      if (error) throw error;

      // Track cancellation
      await this.trackSubscriptionEvent('subscription_canceled', {
        tier: subscription.tier,
        reason,
      });

      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  // Pause subscription
  async pauseSubscription(
    resumeDate?: Date
  ): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus();
      if (!subscription?.stripeSubscriptionId) return false;

      const { data, error } = await supabase.functions.invoke('pause-subscription', {
        body: { 
          subscriptionId: subscription.stripeSubscriptionId,
          resumeDate: resumeDate?.toISOString(),
          userId: this.userId,
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      return false;
    }
  }

  // Resume paused subscription
  async resumeSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus();
      if (!subscription?.stripeSubscriptionId) return false;

      const { data, error } = await supabase.functions.invoke('resume-subscription', {
        body: { 
          subscriptionId: subscription.stripeSubscriptionId,
          userId: this.userId,
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      return false;
    }
  }

  // Update payment method
  async updatePaymentMethod(): Promise<boolean> {
    try {
      // Create setup intent
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: { userId: this.userId }
      });

      if (error) throw error;

      // Initialize payment sheet for setup
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Catalyft',
        setupIntentClientSecret: data.clientSecret,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customerId,
        returnURL: 'catalyft://payment-method-updated',
      });

      if (initError) {
        console.error('Setup intent init error:', initError);
        return false;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();
      
      return !presentError;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      return false;
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-payment-methods', {
        body: { userId: this.userId }
      });

      if (error) throw error;
      return data.paymentMethods;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return [];
    }
  }

  // Get payment history
  async getPaymentHistory(limit = 10): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get payment history:', error);
      return [];
    }
  }

  // Get invoices
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-invoices', {
        body: { userId: this.userId }
      });

      if (error) throw error;
      return data.invoices;
    } catch (error) {
      console.error('Failed to get invoices:', error);
      return [];
    }
  }

  // Apply promo code
  async applyPromoCode(code: string): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { 
          code,
          userId: this.userId,
        }
      });

      if (error) throw error;
      return data.promoCode;
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      return null;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getSubscriptionStatus();
    return subscription?.status === 'active' || subscription?.status === 'trialing';
  }

  // Get user's subscription tier
  async getCurrentTier(): Promise<'Free' | 'Premium' | 'Elite'> {
    const subscription = await this.getSubscriptionStatus();
    if (!subscription || !this.isSubscriptionActive(subscription)) {
      return 'Free';
    }
    return subscription.tier;
  }

  // Check if subscription is active
  private isSubscriptionActive(subscription: Subscription): boolean {
    return ['active', 'trialing'].includes(subscription.status);
  }

  // Handle successful payment
  private async onPaymentSuccess(priceId: string): Promise<void> {
    try {
      // Clear any cached subscription data
      await AsyncStorage.removeItem('subscription_cache');
      
      // Refresh subscription status
      await this.getSubscriptionStatus();
      
      // Track successful payment
      await this.trackSubscriptionEvent('payment_success', { priceId });
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  }

  // Update local subscription cache
  private async updateLocalSubscription(subscription: Subscription): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'subscription_cache',
        JSON.stringify({
          subscription,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to update local subscription:', error);
    }
  }

  // Track subscription events for analytics
  private async trackSubscriptionEvent(
    event: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('analytics_events').insert({
        user_id: this.userId,
        event_name: event,
        event_properties: properties,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // Handle App Store purchase (for iOS)
  async handleAppStorePurchase(
    receipt: string,
    productId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-app-store-purchase', {
        body: {
          receipt,
          productId,
          userId: this.userId,
          platform: 'ios',
        }
      });

      if (error) throw error;
      
      if (data.valid) {
        await this.updateLocalSubscription(data.subscription);
      }
      
      return data.valid;
    } catch (error) {
      console.error('Failed to verify App Store purchase:', error);
      return false;
    }
  }

  // Handle Google Play purchase (for Android)
  async handleGooglePlayPurchase(
    purchaseToken: string,
    productId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-google-play-purchase', {
        body: {
          purchaseToken,
          productId,
          userId: this.userId,
          platform: 'android',
        }
      });

      if (error) throw error;
      
      if (data.valid) {
        await this.updateLocalSubscription(data.subscription);
      }
      
      return data.valid;
    } catch (error) {
      console.error('Failed to verify Google Play purchase:', error);
      return false;
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('restore-purchases', {
        body: {
          userId: this.userId,
          platform: Platform.OS,
        }
      });

      if (error) throw error;
      
      if (data.subscription) {
        await this.updateLocalSubscription(data.subscription);
      }
      
      return !!data.subscription;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return false;
    }
  }
}

export default StripePaymentService.getInstance();