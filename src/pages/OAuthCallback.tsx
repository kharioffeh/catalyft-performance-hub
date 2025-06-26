
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state'); // This should be the athlete_uuid
      const error = searchParams.get('error');

      if (error) {
        toast({
          title: "Connection failed",
          description: "Wearable connection was cancelled or failed.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      if (!code || !state) {
        toast({
          title: "Connection failed",
          description: "Missing authorization code or state.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      if (!profile?.id || profile.id !== state) {
        toast({
          title: "Connection failed",
          description: "Invalid session or mismatched user.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('solo-link-wearable', {
          body: {
            athlete_uuid: profile.id,
            provider: 'whoop',
            code: code,
          },
        });

        if (error) throw error;

        toast({
          title: "Wearable connected! 💫",
          description: "Your Whoop data is now syncing successfully.",
        });

        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast({
          title: "Connection failed",
          description: "Unable to complete the connection. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [searchParams, navigate, profile, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connecting your wearable...</h2>
        <p className="text-white/70">Please wait while we complete the setup.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
