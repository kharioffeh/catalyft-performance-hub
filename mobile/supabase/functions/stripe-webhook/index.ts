import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  
  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
    
    console.log(`🔔 Webhook received: ${event.type}`)
    
    // Process the webhook event
    const result = await processWebhookEvent(event)
    
    return new Response(
      JSON.stringify({ received: true, type: event.type, result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    console.error('❌ Webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    // ============= SUBSCRIPTION EVENTS =============
    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
    
    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
    
    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
    
    case 'customer.subscription.trial_will_end':
      return await handleTrialWillEnd(event.data.object as Stripe.Subscription)
    
    // ============= PAYMENT EVENTS =============
    case 'payment_intent.succeeded':
      return await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
    
    case 'payment_intent.payment_failed':
      return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
    
    case 'invoice.payment_succeeded':
      return await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
    
    case 'invoice.payment_failed':
      return await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
    
    case 'invoice.upcoming':
      return await handleUpcomingInvoice(event.data.object as Stripe.Invoice)
    
    // ============= CUSTOMER EVENTS =============
    case 'customer.created':
      return await handleCustomerCreated(event.data.object as Stripe.Customer)
    
    case 'customer.updated':
      return await handleCustomerUpdated(event.data.object as Stripe.Customer)
    
    case 'payment_method.attached':
      return await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
    
    case 'payment_method.detached':
      return await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
    
    // ============= REFUND/DISPUTE EVENTS =============
    case 'charge.refunded':
      return await handleChargeRefunded(event.data.object as Stripe.Charge)
    
    case 'charge.dispute.created':
      return await handleDisputeCreated(event.data.object as Stripe.Dispute)
    
    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`)
      return { handled: false, type: event.type }
  }
}

// ==================== SUBSCRIPTION HANDLERS ====================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Creating subscription:', subscription.id)
  
  const tier = getTierFromPriceId(subscription.items.data[0].price.id)
  const userId = subscription.metadata.userId || await getUserIdFromCustomer(subscription.customer as string)
  
  if (!userId) {
    throw new Error('No userId found for subscription')
  }
  
  // Create or update subscription record
  const { data, error } = await supabase.from('subscriptions').upsert({
    id: subscription.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    user_id: userId,
    tier,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: subscription.trial_start 
      ? new Date(subscription.trial_start * 1000).toISOString() 
      : null,
    trial_end: subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString() 
      : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  
  if (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
  
  // Track event
  await trackAnalyticsEvent(userId, 'subscription_created', {
    tier,
    status: subscription.status,
    trial: !!subscription.trial_end,
    price: subscription.items.data[0].price.unit_amount! / 100,
    interval: subscription.items.data[0].price.recurring?.interval,
  })
  
  // Send welcome email if active or trialing
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    await sendNotification(userId, 'subscription_welcome', { tier })
  }
  
  return { success: true, subscriptionId: subscription.id }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Updating subscription:', subscription.id)
  
  const tier = getTierFromPriceId(subscription.items.data[0].price.id)
  const userId = subscription.metadata.userId || await getUserIdFromCustomer(subscription.customer as string)
  
  // Get previous subscription state
  const { data: oldSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()
  
  // Update subscription
  const { error } = await supabase
    .from('subscriptions')
    .update({
      tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
  
  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
  
  // Handle tier changes (upgrade/downgrade)
  if (oldSub && oldSub.tier !== tier) {
    const isUpgrade = getTierLevel(tier) > getTierLevel(oldSub.tier)
    await trackAnalyticsEvent(userId, isUpgrade ? 'subscription_upgraded' : 'subscription_downgraded', {
      from: oldSub.tier,
      to: tier,
    })
    
    await sendNotification(userId, isUpgrade ? 'subscription_upgrade' : 'subscription_downgrade', {
      oldTier: oldSub.tier,
      newTier: tier,
    })
  }
  
  // Handle status changes
  if (oldSub && oldSub.status !== subscription.status) {
    if (subscription.status === 'past_due') {
      await sendNotification(userId, 'payment_failed', {})
    } else if (subscription.status === 'active' && oldSub.status === 'trialing') {
      await trackAnalyticsEvent(userId, 'trial_converted', { tier })
    }
  }
  
  return { success: true, updated: true }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Deleting subscription:', subscription.id)
  
  const userId = subscription.metadata.userId || await getUserIdFromCustomer(subscription.customer as string)
  
  // Mark subscription as canceled
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
  
  // Track cancellation
  await trackAnalyticsEvent(userId, 'subscription_canceled', {
    tier: getTierFromPriceId(subscription.items.data[0].price.id),
    reason: subscription.cancellation_details?.reason,
    feedback: subscription.cancellation_details?.feedback,
  })
  
  // Schedule win-back campaigns
  await scheduleWinBackCampaign(userId)
  
  return { success: true, canceled: true }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('⏰ Trial ending soon:', subscription.id)
  
  const userId = subscription.metadata.userId || await getUserIdFromCustomer(subscription.customer as string)
  const trialEndDate = new Date(subscription.trial_end! * 1000)
  
  await sendNotification(userId, 'trial_ending_soon', {
    tier: getTierFromPriceId(subscription.items.data[0].price.id),
    trialEndDate: trialEndDate.toISOString(),
    daysRemaining: 3,
  })
  
  await trackAnalyticsEvent(userId, 'trial_ending_reminder_sent', {})
  
  return { success: true, reminderSent: true }
}

// ==================== PAYMENT HANDLERS ====================

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id)
  
  const userId = paymentIntent.metadata.userId || await getUserIdFromCustomer(paymentIntent.customer as string)
  
  await supabase.from('payments').insert({
    id: paymentIntent.id,
    stripe_payment_intent_id: paymentIntent.id,
    user_id: userId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'succeeded',
    description: paymentIntent.description,
    created_at: new Date().toISOString(),
  })
  
  await trackAnalyticsEvent(userId, 'payment_succeeded', {
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
  })
  
  return { success: true, paymentId: paymentIntent.id }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id)
  
  const userId = paymentIntent.metadata.userId || await getUserIdFromCustomer(paymentIntent.customer as string)
  
  await supabase.from('payments').insert({
    id: paymentIntent.id,
    stripe_payment_intent_id: paymentIntent.id,
    user_id: userId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'failed',
    error_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  })
  
  await sendNotification(userId, 'payment_failed', {
    amount: paymentIntent.amount / 100,
    error: paymentIntent.last_payment_error?.message,
  })
  
  return { success: true, failed: true }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📧 Invoice payment succeeded:', invoice.id)
  
  const userId = invoice.metadata?.userId || await getUserIdFromCustomer(invoice.customer as string)
  
  await supabase.from('invoices').insert({
    id: invoice.id,
    stripe_invoice_id: invoice.id,
    user_id: userId,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'paid',
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    created_at: new Date().toISOString(),
  })
  
  return { success: true, invoiceId: invoice.id }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', invoice.id)
  
  const userId = invoice.metadata?.userId || await getUserIdFromCustomer(invoice.customer as string)
  
  // Update subscription to past_due
  await sendNotification(userId, 'invoice_payment_failed', {
    amount: invoice.amount_due / 100,
    nextAttempt: invoice.next_payment_attempt 
      ? new Date(invoice.next_payment_attempt * 1000).toISOString()
      : null,
  })
  
  return { success: true, failed: true }
}

async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  console.log('📅 Upcoming invoice:', invoice.id)
  
  const userId = invoice.metadata?.userId || await getUserIdFromCustomer(invoice.customer as string)
  
  await sendNotification(userId, 'upcoming_payment', {
    amount: invoice.amount_due / 100,
    date: new Date(invoice.period_end * 1000).toISOString(),
  })
  
  return { success: true, notified: true }
}

// ==================== CUSTOMER HANDLERS ====================

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id)
  
  const userId = customer.metadata.userId
  
  if (userId) {
    await supabase.from('customers').upsert({
      id: customer.id,
      stripe_customer_id: customer.id,
      user_id: userId,
      email: customer.email,
      created_at: new Date().toISOString(),
    })
  }
  
  return { success: true, customerId: customer.id }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('🔄 Customer updated:', customer.id)
  
  await supabase
    .from('customers')
    .update({
      email: customer.email,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customer.id)
  
  return { success: true, updated: true }
}

async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('💳 Payment method attached:', paymentMethod.id)
  
  const userId = await getUserIdFromCustomer(paymentMethod.customer as string)
  
  await supabase.from('payment_methods').insert({
    id: paymentMethod.id,
    stripe_payment_method_id: paymentMethod.id,
    user_id: userId,
    type: paymentMethod.type,
    last4: paymentMethod.card?.last4,
    brand: paymentMethod.card?.brand,
    exp_month: paymentMethod.card?.exp_month,
    exp_year: paymentMethod.card?.exp_year,
    created_at: new Date().toISOString(),
  })
  
  return { success: true, attached: true }
}

async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  console.log('💳 Payment method detached:', paymentMethod.id)
  
  await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id)
  
  return { success: true, detached: true }
}

// ==================== REFUND/DISPUTE HANDLERS ====================

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('💸 Charge refunded:', charge.id)
  
  const userId = charge.metadata?.userId || await getUserIdFromCustomer(charge.customer as string)
  
  await supabase.from('refunds').insert({
    stripe_charge_id: charge.id,
    user_id: userId,
    amount: charge.amount_refunded / 100,
    currency: charge.currency,
    reason: charge.refunds?.data[0]?.reason,
    created_at: new Date().toISOString(),
  })
  
  await sendNotification(userId, 'refund_processed', {
    amount: charge.amount_refunded / 100,
  })
  
  return { success: true, refunded: true }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log('⚠️ Dispute created:', dispute.id)
  
  // Alert admin team about dispute
  await sendAdminAlert('dispute_created', {
    disputeId: dispute.id,
    amount: dispute.amount / 100,
    reason: dispute.reason,
  })
  
  return { success: true, disputeId: dispute.id }
}

// ==================== HELPER FUNCTIONS ====================

function getTierFromPriceId(priceId: string): 'Free' | 'Premium' | 'Elite' {
  // Map your actual Stripe price IDs to tiers
  const tierMap: Record<string, 'Premium' | 'Elite'> = {
    // Replace these with your actual price IDs from Stripe
    [Deno.env.get('STRIPE_PREMIUM_MONTHLY_PRICE_ID') || 'price_premium_monthly']: 'Premium',
    [Deno.env.get('STRIPE_PREMIUM_YEARLY_PRICE_ID') || 'price_premium_yearly']: 'Premium',
    [Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || 'price_elite_monthly']: 'Elite',
    [Deno.env.get('STRIPE_ELITE_YEARLY_PRICE_ID') || 'price_elite_yearly']: 'Elite',
  }
  
  return tierMap[priceId] || 'Free'
}

function getTierLevel(tier: string): number {
  const levels: Record<string, number> = {
    'Free': 0,
    'Premium': 1,
    'Elite': 2,
  }
  return levels[tier] || 0
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  return data?.user_id || null
}

async function trackAnalyticsEvent(userId: string, eventName: string, properties: any) {
  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_name: eventName,
    event_properties: properties,
    created_at: new Date().toISOString(),
  })
}

async function sendNotification(userId: string, type: string, data: any) {
  // Queue notification for sending
  await supabase.from('notifications_queue').insert({
    user_id: userId,
    type,
    data,
    status: 'pending',
    created_at: new Date().toISOString(),
  })
}

async function sendAdminAlert(type: string, data: any) {
  // Send alert to admin team
  console.log('🚨 Admin Alert:', type, data)
  // Implement with your notification service
}

async function scheduleWinBackCampaign(userId: string) {
  // Schedule win-back emails at 3, 7, and 30 days
  const campaigns = [
    { delay_days: 3, discount_percent: 20, message: 'We miss you! Come back with 20% off' },
    { delay_days: 7, discount_percent: 30, message: 'Special offer: 30% off your next month' },
    { delay_days: 30, discount_percent: 50, message: 'Last chance: 50% off to restart your journey' },
  ]
  
  for (const campaign of campaigns) {
    const sendAt = new Date()
    sendAt.setDate(sendAt.getDate() + campaign.delay_days)
    
    await supabase.from('scheduled_campaigns').insert({
      user_id: userId,
      type: 'win_back',
      send_at: sendAt.toISOString(),
      data: campaign,
      status: 'scheduled',
    })
  }
}