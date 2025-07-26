
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencySelector } from '@/components/CurrencySelector';

import { BillingHistory } from '@/components/BillingHistory';
import { Calendar, CreditCard, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { org, isLoading } = useSession();
  const { 
    billing, 
    isLoading: billingLoading, 
    startCheckout, 
    inTrial, 
    daysLeft, 
    trialExpired, 
    needsUpgrade,
    planName,
    planPrice,
    totalMonthlyCost,
    currentPlan,
    isCheckingOut,
    athletePurchases 
  } = useBillingEnhanced();
  
  const { formatPrice } = useCurrency();

  if (isLoading || billingLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-64"></div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!org || !billing) {
    return (
      <GlassCard className="p-8 text-center" accent="error">
        <h3 className="text-xl font-bold text-white mb-2">Unable to Load Billing</h3>
        <p className="text-white/70 mb-4">
          Unable to load your billing information. Please try refreshing the page.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </GlassCard>
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
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trialing': return <Clock className="w-4 h-4" />;
      case 'past_due': return <AlertTriangle className="w-4 h-4" />;
      case 'canceled': return <AlertTriangle className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account & Billing</h1>
          <p className="text-white/70">Manage your subscription and billing information</p>
        </div>
        <CurrencySelector />
      </div>

      {/* Upgrade Banner for Issues */}
      {needsUpgrade && (
        <GlassCard className="p-6" accent="error">
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
                {isCheckingOut ? 'Starting Checkout...' : 'Resolve Issue'}
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

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
                  <span className="font-semibold">{daysLeft} days</span> remaining
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

            <div className="pt-4 border-t border-white/10">
              <Button 
                onClick={() => navigate('/subscriptions')}
                className="w-full"
                variant="outline"
              >
                View All Plans
              </Button>
            </div>
          </div>
        </GlassCard>

        
      </div>

      {/* Billing History */}
      {athletePurchases.length > 0 && (
        <BillingHistory purchases={athletePurchases} />
      )}
    </div>
  );
};

export default BillingPage;
