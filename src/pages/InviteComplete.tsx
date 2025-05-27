import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const InviteComplete: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInviteComplete = async () => {
      try {
        console.log('Processing invite completion...');
        
        // Get the current session after auth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.error('No session found');
          setError('No valid session found. Please check your invitation link.');
          setLoading(false);
          return;
        }

        console.log('Session established:', session.user.email);

        // Fetch profile to determine redirect
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError('Failed to load user profile.');
          setLoading(false);
          return;
        }

        console.log('Profile loaded:', profile);

        // Navigate based on role
        const redirectPath = profile?.role === 'coach' ? '/coach' : '/dashboard';
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });

      } catch (err) {
        console.error('Invite complete error:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleInviteComplete();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Processing your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Invitation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InviteComplete;
