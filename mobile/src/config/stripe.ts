/**
 * Stripe configuration for Catalyft mobile app
 */

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  merchantIdentifier: process.env.STRIPE_MERCHANT_IDENTIFIER || 'merchant.com.catalyft.app',
  // Add other Stripe configuration as needed
};