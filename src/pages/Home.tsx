
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Calendar, BarChart3 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Catalyft AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Performance Coaching
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Optimize your training with intelligent insights from your wearable data, 
            personalized coaching plans, and advanced analytics.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button size="lg" className="mr-4">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardHeader>
              <Activity className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Readiness Tracking</CardTitle>
              <CardDescription>
                Monitor daily readiness with AI-powered insights from your wearable data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Prevent injuries with intelligent workload monitoring and risk alerts.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Optimize training schedules based on recovery data and performance goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Visualize progress with advanced charts and personalized insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to optimize your performance?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of athletes and coaches already using Catalyft AI.
          </p>
          <Link to="/signup">
            <Button size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
