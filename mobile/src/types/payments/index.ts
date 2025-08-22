export interface SubscriptionTier {
  id: string;
  name: 'Free' | 'Premium' | 'Elite';
  stripePriceId?: string;
  price: number;
  interval?: 'month' | 'year';
  features: string[];
  limitations: TierLimitations;
  trial?: number;
  savings?: string;
}

export interface TierLimitations {
  workoutsPerWeek?: number;
  exerciseLibrarySize?: number;
  historyDays?: number;
  ariaChatsPerDay?: number;
  wearableSync: boolean;
  advancedAnalytics: boolean;
  mealPlanning: boolean;
  formAnalysis: boolean;
  customWorkoutPlans: boolean;
  barcodeScanning: boolean;
  exportData: boolean;
  prioritySupport: boolean;
  groupChallenges: boolean;
  personalizedProgramming: boolean;
  coachCheckIns: boolean;
  supplementGuidance: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'Free' | 'Premium' | 'Elite';
  status: SubscriptionStatus;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  description?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'partially_refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  validUntil?: Date;
  maxUses?: number;
  currentUses: number;
  applicableTiers: ('Premium' | 'Elite')[];
}

export interface CheckoutSession {
  sessionId: string;
  clientSecret?: string;
  ephemeralKey?: string;
  customerId?: string;
  publishableKey?: string;
}

export interface SubscriptionChange {
  type: 'upgrade' | 'downgrade' | 'cancel' | 'resume';
  fromTier: string;
  toTier: string;
  effectiveDate: Date;
  reason?: string;
}

export interface UsageStats {
  workoutsThisWeek: number;
  workoutsLimit?: number;
  aiChatsToday: number;
  aiChatsLimit?: number;
  storageUsedMB: number;
  storageLimitMB?: number;
  lastWorkoutDate?: Date;
  featuresUsed: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate?: Date;
  paidAt?: Date;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  unitAmount: number;
}

export interface FeatureKey {
  key: string;
  name: string;
  description: string;
  requiredTier: 'Free' | 'Premium' | 'Elite';
  category: 'workout' | 'nutrition' | 'analytics' | 'ai' | 'social' | 'export';
}

export interface PaywallTrigger {
  id: string;
  type: 'feature_limit' | 'value_moment' | 'time_based' | 'engagement';
  condition: string;
  lastShown?: Date;
  impressions: number;
  conversions: number;
}

export interface RevenueMetrics {
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  churnRate: number;
  trialConversionRate: number;
  averageSubscriptionLength: number;
  revenueByTier: Record<string, number>;
  topFeaturesByUsage: string[];
}