import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BillingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to enhanced billing page
    navigate('/billing-enhanced', { replace: true });
  }, [navigate]);

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
};

export default BillingPage;
