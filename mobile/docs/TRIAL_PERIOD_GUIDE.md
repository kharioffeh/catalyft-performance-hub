# 🎯 Trial Period Complete Guide

## How Trial Periods Work in Catalyft

### 📊 Trial Timeline

```
Day 0: User signs up
  ↓
Day 1-7/14: Trial Period (Full Access)
  ↓
Day 4/11: Trial ending reminder sent
  ↓
Day 7/14: Trial ends
  ↓
Two outcomes:
  → Card charged automatically (if payment method added)
  → Subscription paused (if no payment method)
```

## 🔧 Technical Implementation

### 1. **Subscription States During Trial**

```typescript
// When user starts trial
{
  status: 'trialing',
  trial_start: '2024-01-01T00:00:00Z',
  trial_end: '2024-01-08T00:00:00Z',  // 7 days later
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-01-08T00:00:00Z'
}

// After trial converts
{
  status: 'active',
  trial_start: '2024-01-01T00:00:00Z',
  trial_end: '2024-01-08T00:00:00Z',
  current_period_start: '2024-01-08T00:00:00Z',
  current_period_end: '2024-02-08T00:00:00Z'  // Next billing period
}
```

### 2. **Stripe Webhook Events for Trials**

| Event | When It Fires | What Happens |
|-------|--------------|--------------|
| `customer.subscription.created` | Trial starts | User gets premium access |
| `customer.subscription.trial_will_end` | 3 days before trial ends | Send reminder email |
| `customer.subscription.updated` | Trial converts to paid | Charge card, keep access |
| `invoice.payment_succeeded` | First payment after trial | Record payment |
| `customer.subscription.deleted` | Trial ends without payment | Remove premium access |

### 3. **User Experience During Trial**

```typescript
// In your app, the user sees:
const TrialBanner = () => {
  const { subscription } = useSubscription();
  
  if (subscription?.status === 'trialing') {
    const daysLeft = getDaysUntilTrialEnd(subscription.trial_end);
    
    return (
      <View style={styles.trialBanner}>
        <Text>🎉 {daysLeft} days left in your free trial</Text>
        <Button title="Add Payment Method" onPress={addCard} />
      </View>
    );
  }
}
```

## 🎮 Trial Configuration Options

### Option 1: Price-Level Trial (Recommended)
Set in Stripe Dashboard on the price itself:
- ✅ Automatic for all subscriptions
- ✅ Easy to manage
- ✅ Works with `trial_from_plan: true`

### Option 2: Subscription-Level Trial
Set when creating subscription:
```typescript
// Fixed number of days
stripe.subscriptions.create({
  trial_period_days: 30,  // Override price trial
})

// Specific end date
stripe.subscriptions.create({
  trial_end: Math.floor(Date.now() / 1000) + (86400 * 14),  // 14 days
})

// No trial (immediate charge)
stripe.subscriptions.create({
  trial_period_days: 0,
})
```

### Option 3: Conditional Trials
```typescript
// In your create-subscription Edge Function
const trialDays = await determineTrialEligibility(userId);

const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: trialDays,  // 0 if not eligible
})

async function determineTrialEligibility(userId: string): Promise<number> {
  // Check if user has had a trial before
  const { data: previousTrials } = await supabase
    .from('subscriptions')
    .select('trial_start')
    .eq('user_id', userId)
    .not('trial_start', 'is', null);
  
  if (previousTrials?.length > 0) {
    return 0;  // No trial for returning users
  }
  
  // First-time user gets full trial
  return tier === 'Elite' ? 14 : 7;
}
```

## 💳 Payment Method Requirements

### During Trial:
- **Not Required**: Users can start trial without a card
- **Recommended**: Prompt to add card for seamless conversion

### Trial End Scenarios:

| Has Payment Method? | Trial Converts? | Result |
|-------------------|----------------|---------|
| ✅ Yes | Automatically | Charged immediately, subscription continues |
| ❌ No | Manual required | Subscription becomes `incomplete`, user must add card |
| ❌ No + Grace Period | Within 23 hours | Can still convert by adding payment |

## 🔔 Trial Notifications

Your system sends these automatically:

### 1. **Trial Started** (Immediate)
```typescript
// Triggered by webhook handler
await sendNotification(userId, 'trial_started', {
  tier: 'Premium',
  trialEndDate: '2024-01-08',
  features: ['Unlimited workouts', 'AI Coach', 'Analytics']
})
```

### 2. **Trial Ending Soon** (3 days before)
```typescript
// Triggered by customer.subscription.trial_will_end
await sendNotification(userId, 'trial_ending_soon', {
  daysRemaining: 3,
  tier: 'Premium',
  actionRequired: !hasPaymentMethod
})
```

### 3. **Trial Converted** (On successful charge)
```typescript
await sendNotification(userId, 'trial_converted', {
  tier: 'Premium',
  nextBillingDate: '2024-02-08',
  amount: 9.99
})
```

### 4. **Trial Expired** (If not converted)
```typescript
await sendNotification(userId, 'trial_expired', {
  tier: 'Premium',
  specialOffer: '20% off if you subscribe today'
})
```

## 📱 In-App Trial Management

### Check Trial Status:
```typescript
const useTrialStatus = () => {
  const { subscription } = useSubscription();
  
  const isInTrial = subscription?.status === 'trialing';
  const trialEndsAt = subscription?.trial_end;
  const daysRemaining = trialEndsAt 
    ? Math.ceil((new Date(trialEndsAt) - new Date()) / 86400000)
    : 0;
  
  return {
    isInTrial,
    trialEndsAt,
    daysRemaining,
    hasExpired: subscription?.status === 'incomplete'
  };
};
```

### Display Trial UI:
```typescript
const SubscriptionCard = () => {
  const { isInTrial, daysRemaining } = useTrialStatus();
  
  if (isInTrial) {
    return (
      <Card>
        <Badge>FREE TRIAL</Badge>
        <Title>Premium - Trial</Title>
        <Subtitle>{daysRemaining} days remaining</Subtitle>
        <Button onPress={addPaymentMethod}>
          Add Payment Method to Continue
        </Button>
        <Text style={styles.small}>
          No charge until trial ends
        </Text>
      </Card>
    );
  }
  // ... regular subscription UI
};
```

## 🎯 Best Practices

### 1. **Clear Communication**
- Show trial end date prominently
- Explain what happens when trial ends
- Send timely reminders

### 2. **Smooth Conversion**
- Request payment method during trial (not required)
- Offer incentive to add card early
- Make cancellation easy to build trust

### 3. **Trial Restrictions**
```typescript
// Limit one trial per user
const hasHadTrial = await checkPreviousTrials(userId);
if (hasHadTrial) {
  subscription.trial_period_days = 0;
}

// Different trials for different sources
if (referralCode) {
  subscription.trial_period_days = 30;  // Extended for referrals
}
```

### 4. **Analytics Tracking**
Track these trial metrics:
- Trial start rate
- Trial-to-paid conversion rate
- Time to add payment method
- Trial cancellation reasons

## 🚀 Testing Trials

### With Stripe CLI:
```bash
# Start a trial
stripe trigger customer.subscription.created \
  --override subscription:status=trialing

# Trial ending soon
stripe trigger customer.subscription.trial_will_end

# Trial converting
stripe trigger customer.subscription.updated \
  --override subscription:status=active
```

### Test Card Numbers:
- `4242 4242 4242 4242` - Always succeeds
- `4000 0000 0000 0341` - Requires authentication (good for testing 3DS)
- `4000 0000 0000 9995` - Fails with insufficient funds

## 🔧 Troubleshooting

### Common Issues:

1. **Trial not starting:**
   - Check if price has trial configured
   - Verify `trial_from_plan: true` is set
   - Check user hasn't had trial before

2. **Not converting automatically:**
   - Verify payment method is attached
   - Check if payment method is set as default
   - Look for failed payment in Stripe Dashboard

3. **User charged during trial:**
   - Check subscription start date
   - Verify trial_end is in the future
   - Check for immediate charges (setup fees)

## 📊 Trial Analytics Queries

```sql
-- Trial conversion rate
SELECT 
  COUNT(CASE WHEN status = 'active' AND trial_end IS NOT NULL THEN 1 END)::float / 
  COUNT(CASE WHEN trial_start IS NOT NULL THEN 1 END) * 100 as conversion_rate
FROM subscriptions;

-- Average time to convert
SELECT 
  AVG(EXTRACT(DAY FROM (trial_end - created_at))) as avg_days_to_convert
FROM subscriptions
WHERE status = 'active' AND trial_end IS NOT NULL;

-- Trial drop-off by day
SELECT 
  EXTRACT(DAY FROM (canceled_at - trial_start)) as day_of_trial,
  COUNT(*) as cancellations
FROM subscriptions
WHERE trial_start IS NOT NULL AND canceled_at IS NOT NULL
GROUP BY day_of_trial
ORDER BY day_of_trial;
```