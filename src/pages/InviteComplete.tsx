
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AthleteSignupForm } from '@/components/AthleteSignupForm';
import { AlertCircle, CheckCircle } from 'lucide-react';

const InviteComplete: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const handleInviteComplete = async () => {
      try {
        const type = searchParams.get('type');
        const token = searchParams.get('token_hash') || searchParams.get('token');
        
        console.log('Invite complete params:', { type, token: !!token });

        if (type !== 'signup') {
          setError('Invalid invitation link. Please check your email for the correct link.');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Missing invitation token. Please check your email for the correct link.');
          setLoading(false);
          return;
        }

        // Exchange the token for a session
        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Invalid or expired invitation link. Please request a new invitation.');
          setLoading(false);
          return;
        }

        if (!sessionData.session?.user) {
          setError('Failed to authenticate. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Session established:', sessionData.session.user.email);
        setSession(sessionData.session);

        // Check if user already has a profile with role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          setError('Failed to load user profile.');
          setLoading(false);
          return;
        }

        if (profileData?.role) {
          console.log('User has existing role:', profileData.role);
          // User already has a role, redirect appropriately
          navigate(profileData.role === 'coach' ? '/coach' : '/dashboard');
          return;
        }

        // User needs to complete signup
        setUserProfile(profileData);
        setLoading(false);

      } catch (err) {
        console.error('Invite complete error:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleInviteComplete();
  }, [searchParams, navigate]);

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

  if (session && !userProfile?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Complete Your Signup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AthleteSignupForm 
              email={session.user.email} 
              userId={session.user.id}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InviteComplete;
