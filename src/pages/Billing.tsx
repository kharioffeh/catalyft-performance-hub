
import React from 'react';
import { useBilling } from '@/hooks/useBilling';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const BillingPage: React.FC = () => {
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
    isCheckingOut 
  } = useBilling();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded w-64"></div>
            <div className="h-64 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account & Billing</h1>
          <p className="text-white/70">Manage your subscription and billing information</p>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{planName}</h3>
              <p className="text-2xl font-bold text-white mb-1">{planPrice}</p>
              <p className="text-white/60 text-sm mb-4">
                {billing.role === 'coach' 
                  ? 'Full coaching features with athlete management'
                  : 'Personal training programs and analytics'
                }
              </p>
              
              {billing.plan_status !== 'active' && (
                <Button 
                  onClick={() => startCheckout(billing.role)}
                  disabled={isCheckingOut}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isCheckingOut ? 'Starting Checkout...' : 'Upgrade to Full Plan'}
                </Button>
              )}
            </div>

            <div className="space-y-4">
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
                  {billing.role === 'coach' ? (
                    <>
                      <li>• Unlimited athlete management</li>
                      <li>• Advanced analytics & insights</li>
                      <li>• Program templates & library</li>
                      <li>• AI-powered coaching tools</li>
                      <li>• Risk assessment & alerts</li>
                    </>
                  ) : (
                    <>
                      <li>• Personal training programs</li>
                      <li>• Performance analytics</li>
                      <li>• AI workout generation</li>
                      <li>• Progress tracking</li>
                      <li>• Wearable integrations</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Plan Options */}
        {billing.plan_status === 'trialing' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coach Plan */}
            <GlassCard className="p-6" accent={billing.role === 'coach' ? 'primary' : undefined}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Coach Plan</h3>
                <div className="text-3xl font-bold text-white mb-1">$29</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
              
              <ul className="space-y-2 text-sm text-white/80 mb-6">
                <li>• Unlimited athletes</li>
                <li>• Team management</li>
                <li>• Advanced analytics</li>
                <li>• Program templates</li>
                <li>• Risk assessment</li>
              </ul>
              
              <Button 
                onClick={() => startCheckout('coach')}
                disabled={isCheckingOut}
                variant={billing.role === 'coach' ? 'default' : 'outline'}
                className="w-full"
              >
                {billing.role === 'coach' ? 'Current Plan' : 'Choose Coach Plan'}
              </Button>
            </GlassCard>

            {/* Solo Plan */}
            <GlassCard className="p-6" accent={billing.role === 'solo' ? 'primary' : undefined}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Solo Plan</h3>
                <div className="text-3xl font-bold text-white mb-1">$9</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
              
              <ul className="space-y-2 text-sm text-white/80 mb-6">
                <li>• Personal programs</li>
                <li>• AI workout generation</li>
                <li>• Performance tracking</li>
                <li>• Wearable sync</li>
                <li>• Progress analytics</li>
              </ul>
              
              <Button 
                onClick={() => startCheckout('solo')}
                disabled={isCheckingOut}
                variant={billing.role === 'solo' ? 'default' : 'outline'}
                className="w-full"
              >
                {billing.role === 'solo' ? 'Current Plan' : 'Choose Solo Plan'}
              </Button>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
