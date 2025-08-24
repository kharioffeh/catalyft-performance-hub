import { supabase } from '../supabase';
import { STRIPE_CONFIG } from '../../config/stripe';

class UserStripeLinker {
  private static instance: UserStripeLinker;
  
  static getInstance(): UserStripeLinker {
    if (!this.instance) {
      this.instance = new UserStripeLinker();
    }
    return this.instance;
  }

  /**
   * Ensure user has a Stripe customer ID
   */
  async ensureStripeCustomer(userId: string): Promise<string> {
    try {
      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingCustomer?.stripe_customer_id) {
        console.log('Existing Stripe customer found:', existingCustomer.stripe_customer_id);
        return existingCustomer.stripe_customer_id;
      }

      // Get user details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create Stripe customer via Edge Function
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: {
          userId: user.id,
          email: user.email,
          metadata: {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;
      
      console.log('Created new Stripe customer:', data.customerId);
      return data.customerId;
    } catch (error) {
      console.error('Error ensuring Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a subscription with proper user linking
   */
  async createSubscription(
    userId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<any> {
    try {
      // Ensure customer exists first
      const customerId = await this.ensureStripeCustomer(userId);

      // Create subscription via Edge Function
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          userId,
          customerId,
          priceId,
          paymentMethodId,
          metadata: {
            userId,
            customerId,
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Sync existing Stripe customers with Supabase users
   */
  async syncExistingCustomers(): Promise<void> {
    try {
      const { data: users } = await supabase
        .from('auth.users')
        .select('id, email');

      if (!users) return;

      for (const user of users) {
        await this.ensureStripeCustomer(user.id);
      }
      
      console.log('Synced all users with Stripe');
    } catch (error) {
      console.error('Error syncing customers:', error);
    }
  }
}

export default UserStripeLinker.getInstance();
