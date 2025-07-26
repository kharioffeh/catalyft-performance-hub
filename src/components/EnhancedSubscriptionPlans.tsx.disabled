
import React from 'react';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';
import { useSession } from '@/hooks/useSession';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Users, Zap } from 'lucide-react';

export const EnhancedSubscriptionPlans: React.FC = () => {
  const { org } = useSession();
  const { 
    coachPlans, 
    soloPlans, 
    startCheckout, 
    isCheckingOut, 
    getPlanPrice,
    isLoading 
  } = useBillingEnhanced();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/20 rounded w-64"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-96 bg-white/20 rounded"></div>
          <div className="h-96 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  const isCurrentPlan = (planId: string) => org?.plan?.id === planId;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-white/70">Select the perfect plan for your coaching needs</p>
      </div>

      {/* Coach Plans */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Coach Plans
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {coachPlans.map((plan) => (
            <GlassCard 
              key={plan.id} 
              className={`p-6 ${isCurrentPlan(plan.id) ? 'ring-2 ring-indigo-400' : ''}`}
              accent={isCurrentPlan(plan.id) ? 'primary' : undefined}
            >
              {isCurrentPlan(plan.id) && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white">
                  Current Plan
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-indigo-400" />
                  <h4 className="text-xl font-semibold text-white">{plan.label}</h4>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{getPlanPrice(plan.id)}</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
              
              <ul className="space-y-2 text-sm text-white/80 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Up to {plan.max_athletes} athletes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Team management tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Performance analytics
                </li>
                {plan.has_adaptive_replan && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Adaptive replanning
                  </li>
                )}
                {plan.long_term_analytics && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Advanced analytics
                  </li>
                )}
                {plan.export_api && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Data export & API
                  </li>
                )}
                {plan.priority_support && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Priority support
                  </li>
                )}
              </ul>
              
              <Button 
                onClick={() => startCheckout(plan.id)}
                disabled={isCheckingOut || isCurrentPlan(plan.id)}
                className="w-full"
                variant={isCurrentPlan(plan.id) ? "outline" : "default"}
              >
                {isCurrentPlan(plan.id) 
                  ? 'Current Plan' 
                  : isCheckingOut 
                    ? 'Starting...' 
                    : 'Choose Plan'
                }
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Solo Plans */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Solo Plans
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {soloPlans.map((plan) => (
            <GlassCard key={plan.id} className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-purple-400" />
                  <h4 className="text-xl font-semibold text-white">{plan.label}</h4>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{getPlanPrice(plan.id)}</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
              
              <ul className="space-y-2 text-sm text-white/80 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Personal training
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  AI workout generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Performance tracking
                </li>
                {plan.has_adaptive_replan && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Adaptive programs
                  </li>
                )}
                {plan.long_term_analytics && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Advanced analytics
                  </li>
                )}
                {plan.export_api && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Data export & API
                  </li>
                )}
                {plan.priority_support && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Priority support
                  </li>
                )}
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
  );
};
