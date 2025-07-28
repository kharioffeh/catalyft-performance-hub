
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: 'nutritionLogging' | 'aiChatMessages' | 'advancedAnalytics' | 'customPrograms';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const FEATURE_NAMES = {
  nutritionLogging: 'Nutrition Logging',
  aiChatMessages: 'AI Chat Assistant',
  advancedAnalytics: 'Advanced Analytics',
  customPrograms: 'Custom Programs'
};

const FEATURE_DESCRIPTIONS = {
  nutritionLogging: 'Track your nutrition, log meals, and get detailed macro insights.',
  aiChatMessages: 'Get personalized workout advice and fitness guidance from our AI assistant.',
  advancedAnalytics: 'Access detailed performance analytics with unlimited history.',
  customPrograms: 'Create and customize your own training programs.'
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  className
}) => {
  const { canAccess, isPro, startCheckout, isStartingCheckout } = useSubscription();

  // If user can access the feature, show the content
  if (canAccess(feature)) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <Card className={cn("border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50", className)}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Lock className="w-5 h-5 text-amber-600" />
          Pro Feature
        </CardTitle>
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-100 mx-auto">
          {FEATURE_NAMES[feature]}
        </Badge>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-700">
          {FEATURE_DESCRIPTIONS[feature]}
        </p>
        
        <div className="bg-white/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-gray-800">Unlock with Pro:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              Unlimited workout tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              AI-powered chat assistant
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              Advanced analytics & insights
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              Custom training programs
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => startCheckout('monthly')}
            disabled={isStartingCheckout}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            size="lg"
          >
            {isStartingCheckout ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            Upgrade to Pro - $14.99/month
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            onClick={() => startCheckout('yearly')}
            disabled={isStartingCheckout}
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            {isStartingCheckout ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Crown className="w-5 h-5 mr-2" />
            )}
            Save 20% with Yearly Plan
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          7-day free trial • Cancel anytime • No setup fees
        </p>
      </CardContent>
    </Card>
  );
};

// Convenience wrapper for inline feature restrictions
export const ProBadge: React.FC<{ feature: keyof typeof FEATURE_NAMES; className?: string }> = ({ 
  feature, 
  className 
}) => {
  const { canAccess } = useSubscription();
  
  if (canAccess(feature)) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn("border-amber-500 text-amber-700 bg-amber-100", className)}
    >
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  );
};

// Hook for checking feature access in components
export const useFeatureAccess = () => {
  const { canAccess, getLimit, isPro, isFree } = useSubscription();
  
  return {
    canAccess,
    getLimit,
    isPro,
    isFree,
    // Specific feature checks
    canUseNutrition: canAccess('nutritionLogging'),
    canUseAI: canAccess('aiChatMessages'),
    canUseAdvancedAnalytics: canAccess('advancedAnalytics'),
    canCreatePrograms: canAccess('customPrograms'),
    // Limits
    maxWorkouts: getLimit('maxWorkouts'),
    analyticsHistoryDays: getLimit('analyticsHistoryDays'),
  };
};
