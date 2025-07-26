
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Catalyft AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/calendar">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </Link>

              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name || user.email}
              </span>
              <Badge variant="secondary">
                Solo
              </Badge>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Overview of your performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Welcome to Catalyft AI! Your performance coaching platform is ready.
              </p>
            </CardContent>
          </Card>



          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Training sessions and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  View your upcoming training sessions and events.
                </p>
                <Link to="/calendar">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Open Calendar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {profile?.full_name || 'Not set'}</p>
              <p><strong>Role:</strong> {profile?.role || 'Not set'}</p>
              <p><strong>Account created:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
