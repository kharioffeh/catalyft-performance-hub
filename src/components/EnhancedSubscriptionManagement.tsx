
import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AthleteManagementCard } from '@/components/AthleteManagementCard';
import { BillingHistory } from '@/components/BillingHistory';
import { Users, Crown, Calendar, CreditCard, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const EnhancedSubscriptionManagement: React.FC = () => {
  const { org, isLoading } = useSession();
  const { startCheckout, isCheckingOut, athletePurchases } = useBillingEnhanced();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-64"></div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <GlassCard className="p-8 text-center" accent="error">
        <Crown className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Subscription Found</h3>
        <p className="text-white/70 mb-4">
          Unable to load your subscription information. Please try refreshing the page.
        </p>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </GlassCard>
    );
  }

  const getStatusColor = () => {
    switch (org.billing_status) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (org.billing_status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trialing': return <Clock className="w-4 h-4" />;
      case 'past_due': return <AlertTriangle className="w-4 h-4" />;
      case 'canceled': return <AlertTriangle className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const usagePercentage = org.max_athletes > 0 ? (org.athlete_count / org.max_athletes) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Upgrade Banner for Issues */}
      {org.needs_upgrade && (
        <GlassCard className="p-6" accent="error">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {org.in_trial && org.trial_days_left === 0 ? 'Trial Expired' : 'Payment Required'}
              </h3>
              <p className="text-white/80 mb-4">
                {org.in_trial && org.trial_days_left === 0
                  ? 'Your free trial has ended. Upgrade to continue using Catalyft AI.'
                  : 'Your payment is past due. Please update your billing to continue.'
                }
              </p>
              <Button 
                onClick={() => startCheckout('coach_pro')}
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
              {org.billing_status.charAt(0).toUpperCase() + org.billing_status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">{org.plan?.label}</h3>
              <p className="text-white/60 text-sm mb-4">{org.plan?.type} plan</p>
            </div>

            {/* Trial Information */}
            {org.in_trial && (
              <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">Free Trial</span>
                </div>
                <p className="text-white text-sm">
                  <span className="font-semibold">{org.trial_days_left} days</span> remaining
                </p>
              </div>
            )}

            {/* Athlete Usage */}
            {org.plan?.type === 'coach' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">Athletes Used</span>
                  <span className="text-white font-medium">
                    {org.athlete_count} / {org.max_athletes === 0 ? '∞' : org.max_athletes}
                  </span>
                </div>
                {org.max_athletes > 0 && (
                  <Progress value={usagePercentage} className="h-2" />
                )}
              </div>
            )}

            {/* Plan Features */}
            <div>
              <h4 className="text-white font-medium mb-2">Plan Features</h4>
              <ul className="space-y-1 text-sm text-white/70">
                {org.plan?.has_aria_full && <li>• AI-powered insights & coaching</li>}
                {org.plan?.has_adaptive_replan && <li>• Adaptive program replanning</li>}
                {org.plan?.long_term_analytics && <li>• Long-term analytics & trends</li>}
                {org.plan?.export_api && <li>• Data export & API access</li>}
                {org.plan?.priority_support && <li>• Priority customer support</li>}
                {org.plan?.type === 'coach' && <li>• Athlete management & monitoring</li>}
                {org.plan?.type === 'solo' && <li>• Personal training optimization</li>}
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Athlete Management Card */}
        <AthleteManagementCard />
      </div>

      {/* Billing History */}
      {athletePurchases.length > 0 && (
        <BillingHistory purchases={athletePurchases} />
      )}
    </div>
  );
};
