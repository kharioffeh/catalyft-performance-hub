
import { useAuth } from '@/contexts/AuthContext';
import { useBilling } from '@/hooks/useBilling';

export interface Organization {
  billing_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  in_trial: boolean;
  trial_days_left: number;
  needs_upgrade: boolean;
  is_subscribed: boolean;
}

export interface SessionData {
  user: ReturnType<typeof useAuth>['user'];
  profile: ReturnType<typeof useAuth>['profile'];
  session: ReturnType<typeof useAuth>['session'];
  org: Organization | null;
  isLoading: boolean;
  signOut: ReturnType<typeof useAuth>['signOut'];
}

export const useSession = (): SessionData => {
  const { user, profile, session, loading: authLoading, signOut } = useAuth();
  const {
    billing,
    inTrial,
    daysLeft,
    needsUpgrade,
    isSubscribed,
    isLoading: billingLoading
  } = useBilling();

  const org: Organization | null = billing ? {
    billing_status: billing.plan_status,
    in_trial: inTrial,
    trial_days_left: daysLeft,
    needs_upgrade: needsUpgrade,
    is_subscribed: isSubscribed
  } : null;

  return {
    user,
    profile,
    session,
    org,
    isLoading: authLoading || billingLoading,
    signOut
  };
};
