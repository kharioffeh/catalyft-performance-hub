
import { useAuth } from '@/contexts/AuthContext';
import { useBillingEnhanced } from '@/hooks/useBillingEnhanced';

export interface Organization {
  athlete_count: number;
  max_athletes: number;
  plan: {
    id: string;
    label: string;
    type: 'coach' | 'solo' | 'topup';
    has_aria_full: boolean;
    has_adaptive_replan: boolean;
    long_term_analytics: boolean;
    export_api: boolean;
    priority_support: boolean;
  } | null;
  billing_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  in_trial: boolean;
  trial_days_left: number;
  needs_upgrade: boolean;
  can_add_athlete: boolean;
  can_purchase_athletes: boolean;
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
    currentPlan,
    currentAthletes,
    maxAthletes,
    canAddAthlete,
    canPurchaseAthletes,
    inTrial,
    daysLeft,
    needsUpgrade,
    isLoading: billingLoading
  } = useBillingEnhanced();

  const org: Organization | null = billing ? {
    athlete_count: currentAthletes,
    max_athletes: maxAthletes,
    plan: currentPlan,
    billing_status: billing.plan_status,
    in_trial: inTrial,
    trial_days_left: daysLeft,
    needs_upgrade: needsUpgrade,
    can_add_athlete: canAddAthlete,
    can_purchase_athletes: canPurchaseAthletes
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
