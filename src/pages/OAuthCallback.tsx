
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const provider = searchParams.get('provider') || 'whoop';

      if (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect your wearable device. Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      if (!code || !profile?.id) {
        setStatus('error');
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      try {
        const response = await supabase.functions.invoke('solo-link-wearable', {
          body: {
            athlete_uuid: profile.id,
            provider,
            code,
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        setStatus('success');
        toast({
          title: 'Wearable Connected',
          description: 'Your device has been connected successfully! Data syncing 💫',
        });
        
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error('Connection error:', error);
        setStatus('error');
        toast({
          title: 'Connection Failed',
          description: 'Failed to complete the connection. Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, profile, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Connecting Your Device
              </h2>
              <p className="text-white/60">
                Please wait while we set up your wearable connection...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connection Successful!
              </h2>
              <p className="text-white/60">
                Redirecting you back to your dashboard...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Connection Failed
              </h2>
              <p className="text-white/60">
                Something went wrong. Redirecting you back...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
