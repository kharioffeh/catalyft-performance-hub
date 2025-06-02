
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AccessControlProps {
  profile: any;
  coachError: any;
  isLoading: boolean;
  coachData: any;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  profile,
  coachError,
  isLoading,
  coachData
}) => {
  // Check if user has the right role
  if (profile?.role !== 'coach') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              This page is only available to coaches.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if coach lookup failed
  if (coachError) {
    console.error('Coach error in Athletes page:', coachError);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coach Setup Required</AlertTitle>
          <AlertDescription className="mt-2">
            Your coach profile needs to be set up. Please contact support or try refreshing the page.
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while fetching coach data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no coach record found
  if (!coachData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coach Profile Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            We couldn't find your coach profile. This might be because your account hasn't been set up as a coach yet.
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null; // Access is granted, render nothing
};
