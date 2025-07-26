// Temporary mock component to resolve build errors
import React from 'react';

export const AdaptiveAdjustmentFeatureGuard = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const EnhancedSubscriptionManagement = () => {
  return <div>Subscription Management (Mock)</div>;
};

export const EnhancedSubscriptionPlans = () => {
  return <div>Subscription Plans (Mock)</div>;
};

export const SessionFeatureGuard = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};