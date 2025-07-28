import React, { useState } from 'react';
import { useSubscription, TIER_FEATURES } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Crown,
  Star,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SubscriptionManager: React.FC = () => {
  const {
    subscription,
    isLoading,
    isTrialing,
    isActive,
    isCanceled,
    isPastDue,
    isFree,
    isPro,
    trialDaysLeft,
    subscriptionEndsAt,
    hasOptedOutAutoSubscription,
    tierFeatures,
    startCheckout,
    cancelSubscription,
    reactivateSubscription,
    manageSubscription,
    setAutoSubscription,
    isStartingCheckout,
    isCanceling,
    isReactivating,
    isManaging,
    isUpdatingAutoSubscription,
  } = useSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-background/50 backdrop-blur-md border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isTrialing) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          <Star className="w-3 h-3 mr-1" />
          Trial ({trialDaysLeft} days left)
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (isCanceled) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-500">
          <Calendar className="w-3 h-3 mr-1" />
          Canceled (expires {subscriptionEndsAt?.toLocaleDateString()})
        </Badge>
      );
    }
    if (isPastDue) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Past Due
        </Badge>
      );
    }
    if (isFree) {
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-500">
          <XCircle className="w-3 h-3 mr-1" />
          Free Tier
        </Badge>
      );
    }
    return null;
  };

  const getTierIcon = () => {
    return isPro ? (
      <Crown className="w-5 h-5 text-yellow-500" />
    ) : (
      <Star className="w-5 h-5 text-gray-500" />
    );
  };

  return (
    <Card className="bg-background/50 backdrop-blur-md border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTierIcon()}
            <div>
              <h3 className="font-semibold text-lg">{tierFeatures.name} Plan</h3>
              <p className="text-sm text-muted-foreground">{tierFeatures.price}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Trial Auto-subscription Notice */}
        {isTrialing && (
          <div className={cn(
            "border rounded-lg p-4",
            hasOptedOutAutoSubscription 
              ? "bg-blue-500/10 border-blue-500/20" 
              : "bg-orange-500/10 border-orange-500/20"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={cn(
                "w-4 h-4", 
                hasOptedOutAutoSubscription ? "text-blue-600" : "text-orange-600"
              )} />
              <span className={cn(
                "font-medium",
                hasOptedOutAutoSubscription ? "text-blue-600" : "text-orange-600"
              )}>
                {hasOptedOutAutoSubscription ? "Trial will end without billing" : "Auto-subscription enabled"}
              </span>
            </div>
            
            <p className={cn(
              "text-sm mb-3",
              hasOptedOutAutoSubscription ? "text-blue-700" : "text-orange-700"
            )}>
              {hasOptedOutAutoSubscription 
                ? `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} and you'll be moved to the Free tier. You can opt back in to auto-subscription anytime.`
                : `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} and you'll be automatically subscribed to Pro ($13.99/month) unless you opt out.`
              }
            </p>

            <div className="flex gap-3">
              <Button
                size="sm"
                variant={hasOptedOutAutoSubscription ? "default" : "outline"}
                onClick={() => setAutoSubscription(!hasOptedOutAutoSubscription)}
                disabled={isUpdatingAutoSubscription}
                className={cn(
                  hasOptedOutAutoSubscription 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-orange-300 text-orange-700 hover:bg-orange-50"
                )}
              >
                {isUpdatingAutoSubscription ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {hasOptedOutAutoSubscription ? "Enable Auto-subscription" : "Opt out of Auto-subscription"}
              </Button>
              
              {!hasOptedOutAutoSubscription && (
                <Button 
                  size="sm"
                  onClick={() => startCheckout('monthly')}
                  disabled={isStartingCheckout}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isStartingCheckout ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Subscribe Now
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Free Tier Limitations */}
        {isFree && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <ArrowUp className="w-4 h-4" />
              <span className="font-medium">Upgrade to Pro</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              You're on the Free tier with limited features. Upgrade to unlock the full Catalyft experience.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => startCheckout('monthly')}
                disabled={isStartingCheckout}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isStartingCheckout ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-1" />
                )}
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}

        {/* Current Features */}
        <div>
          <h4 className="font-medium mb-3">Current Features</h4>
          <ul className="space-y-2">
            {tierFeatures.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          {isFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => startCheckout('monthly')}
                disabled={isStartingCheckout}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isStartingCheckout ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Monthly ($14.99)
              </Button>
              <Button 
                onClick={() => startCheckout('yearly')}
                disabled={isStartingCheckout}
                variant="outline"
              >
                {isStartingCheckout ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Yearly (Save 20%)
              </Button>
            </div>
          )}

          {isPro && (isActive || isTrialing) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={manageSubscription}
                disabled={isManaging}
                variant="outline"
              >
                {isManaging ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Manage Billing
              </Button>
              
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You'll continue to have Pro access 
                      until the end of your billing period, then you'll be moved to the Free tier with limited features.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        cancelSubscription();
                        setShowCancelDialog(false);
                      }}
                      disabled={isCanceling}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isCanceling ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : null}
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {isCanceled && (
            <Button 
              onClick={reactivateSubscription}
              disabled={isReactivating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isReactivating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Reactivate Subscription
            </Button>
          )}

          {isPastDue && (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  Your subscription payment failed. Please update your payment method to continue using Pro features.
                </p>
              </div>
              <Button 
                onClick={manageSubscription}
                disabled={isManaging}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isManaging ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-4 h-4 mr-2" />
                )}
                Update Payment Method
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};