
import React from 'react';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';
import { useCurrency } from '@/hooks/useCurrency';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencySelector } from '@/components/CurrencySelector';
import { AthleteManagementCard } from '@/components/AthleteManagementCard';
import { Calendar, CreditCard, Clock, AlertTriangle, CheckCircle, Users, Crown, TrendingUp } from 'lucide-react';

const BillingEnhancedPage: React.FC = () => {
  const { 
    billing, 
    isLoading, 
    startCheckout, 
    inTrial, 
    daysLeft, 
    trialExpired, 
    needsUpgrade,
    planName,
    planPrice,
    totalMonthlyCost,
    currentPlan,
    coachPlans,
    soloPlans,
    isCheckingOut,
    getPlanPrice,
    athletePurchases 
  } = useBillingEnhanced();

  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/20 rounded"></div>
              <div className="h-64 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Account & Billing</h1>
            <p className="text-white/70">Unable to load billing information.</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (billing.plan_status) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (billing.plan_status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'trialing': return <Clock className="w-5 h-5" />;
      case 'past_due': return <AlertTriangle className="w-5 h-5" />;
      case 'canceled': return <AlertTriangle className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Currency Selector */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Account & Billing</h1>
            <p className="text-white/70">Manage your subscription and billing information</p>
          </div>
          <CurrencySelector />
        </div>

        {/* Upgrade Banner for Expired Trials */}
        {needsUpgrade && (
          <GlassCard className="p-6 border-red-400/30 bg-red-500/10" accent="error">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {trialExpired ? 'Trial Expired' : 'Payment Required'}
                </h3>
                <p className="text-white/80 mb-4">
                  {trialExpired 
                    ? 'Your free trial has ended. Upgrade to continue using Catalyft AI.'
                    : 'Your payment is past due. Please update your billing to continue.'
                  }
                </p>
                <Button 
                  onClick={() => startCheckout(billing.role)}
                  disabled={isCheckingOut}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isCheckingOut ? 'Starting Checkout...' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                  <p className="text-white/60 text-sm">Your subscription details</p>
                </div>
              </div>
              
              <Badge className={`${getStatusColor()} text-white flex items-center gap-2`}>
                {getStatusIcon()}
                {billing.plan_status.charAt(0).toUpperCase() + billing.plan_status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">{planName}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-white">{totalMonthlyCost}</span>
                  <span className="text-white/60 text-sm">per month</span>
                </div>
                {billing.monthly_addon_cost > 0 && (
                  <p className="text-white/60 text-sm">
                    Base: {planPrice} + Add-ons: {formatPrice(billing.monthly_addon_cost)}
                  </p>
                )}
              </div>

              {/* Trial Information */}
              {inTrial && (
                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Free Trial</span>
                  </div>
                  <p className="text-white text-sm">
                    <span className="font-semibold">{daysLeft} days</span> remaining in your trial
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Trial ends on {new Date(billing.trial_end).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Plan Features */}
              <div>
                <h4 className="text-white font-medium mb-2">Plan Features</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  {currentPlan?.has_aria_full && <li>• AI-powered insights & coaching</li>}
                  {currentPlan?.has_adaptive_replan && <li>• Adaptive program replanning</li>}
                  {currentPlan?.long_term_analytics && <li>• Long-term analytics & trends</li>}
                  {currentPlan?.export_api && <li>• Data export & API access</li>}
                  {currentPlan?.priority_support && <li>• Priority customer support</li>}
                  {currentPlan?.type === 'coach' && <li>• Athlete management & monitoring</li>}
                  {currentPlan?.type === 'solo' && <li>• Personal training optimization</li>}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Athlete Management Card */}
          <AthleteManagementCard />
        </div>

        {/* Billing History */}
        {athletePurchases.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {athletePurchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {purchase.athlete_pack_size} Athletes Added
                      </p>
                      <p className="text-white/60 text-sm">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        +{formatPrice(purchase.monthly_cost_added)}/month
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {purchase.currency_code}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Options - Only show during trial */}
        {billing.plan_status === 'trialing' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Plan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Coach Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Coach Plans</h3>
                {coachPlans.map((plan) => (
                  <GlassCard key={plan.id} className="p-6" accent={billing.role === 'coach' ? 'primary' : undefined}>
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-semibold text-white mb-2">{plan.label}</h4>
                      <div className="text-3xl font-bold text-white mb-1">{getPlanPrice(plan.id)}</div>
                      <div className="text-white/60 text-sm">per month</div>
                    </div>
                    
                    <ul className="space-y-2 text-sm text-white/80 mb-6">
                      <li>• Up to {plan.max_athletes} athletes</li>
                      <li>• Team management tools</li>
                      <li>• Performance analytics</li>
                      {plan.has_adaptive_replan && <li>• Adaptive replanning</li>}
                      {plan.long_term_analytics && <li>• Advanced analytics</li>}
                      {plan.export_api && <li>• Data export & API</li>}
                      {plan.priority_support && <li>• Priority support</li>}
                    </ul>
                    
                    <Button 
                      onClick={() => startCheckout(plan.id)}
                      disabled={isCheckingOut}
                      className="w-full"
                    >
                      {isCheckingOut ? 'Starting...' : 'Choose Plan'}
                    </Button>
                  </GlassCard>
                ))}
              </div>

              {/* Solo Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Solo Plans</h3>
                {soloPlans.map((plan) => (
                  <GlassCard key={plan.id} className="p-6" accent={billing.role === 'solo' ? 'primary' : undefined}>
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-semibold text-white mb-2">{plan.label}</h4>
                      <div className="text-3xl font-bold text-white mb-1">{getPlanPrice(plan.id)}</div>
                      <div className="text-white/60 text-sm">per month</div>
                    </div>
                    
                    <ul className="space-y-2 text-sm text-white/80 mb-6">
                      <li>• Personal training</li>
                      <li>• AI workout generation</li>
                      <li>• Performance tracking</li>
                      {plan.has_adaptive_replan && <li>• Adaptive programs</li>}
                      {plan.long_term_analytics && <li>• Advanced analytics</li>}
                      {plan.export_api && <li>• Data export & API</li>}
                      {plan.priority_support && <li>• Priority support</li>}
                    </ul>
                    
                    <Button 
                      onClick={() => startCheckout(plan.id)}
                      disabled={isCheckingOut}
                      className="w-full"
                    >
                      {isCheckingOut ? 'Starting...' : 'Choose Plan'}
                    </Button>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingEnhancedPage;
