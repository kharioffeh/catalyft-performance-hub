
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBilling } from '@/hooks/useBilling';

interface ProtectAppGateProps {
  children: React.ReactNode;
}

const ProtectAppGate: React.FC<ProtectAppGateProps> = ({ children }) => {
  const { billing, isLoading, needsUpgrade } = useBilling();
  const location = useLocation();

  // Don't block while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access to billing page even if upgrade needed
  if (location.pathname === '/billing') {
    return <>{children}</>;
  }

  // Redirect to billing if upgrade needed
  if (needsUpgrade) {
    return <Navigate to="/billing" replace />;
  }

  return <>{children}</>;
};

export default ProtectAppGate;
