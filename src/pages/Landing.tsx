import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Heart, 
  Moon, 
  Zap, 
  Smartphone, 
  Users, 
  TrendingUp,
  Shield,
  Clock,
  Brain,
  Download,
  X
} from 'lucide-react';

const Landing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [showMobileAlert, setShowMobileAlert] = useState(false);

  useEffect(() => {
    if (searchParams.get('redirect') === 'mobile') {
      setShowMobileAlert(true);
    }
  }, [searchParams]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Mobile App Alert */}
      {showMobileAlert && (
        <Alert className="mx-4 mt-4 bg-blue-900/50 border-blue-400 text-blue-100">
          <Download className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Looking for the full app experience?</strong> Download our mobile app for iOS or Android to access training, analytics, and wearable integrations.
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileAlert(false)}
              className="text-blue-100 hover:bg-blue-800/50 ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-400/30">
            🚀 AI-Powered Performance Tracking
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Unlock Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Peak Performance
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced wearable technology meets AI coaching to optimize your recovery, 
            sleep, and training. Join thousands of athletes already maximizing their potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Link to="/signup">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
              <Link to="/features">Learn More</Link>
            </Button>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>50,000+ Athletes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Athletes Choose
              <span className="text-blue-400"> Catalyft</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of performance optimization with cutting-edge technology designed for serious athletes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Real-Time Strain Monitoring",
                description: "Track your training load and optimize intensity with precise biometric feedback."
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Advanced Recovery Metrics",
                description: "HRV analysis and personalized recovery recommendations to prevent overtraining."
              },
              {
                icon: <Moon className="h-8 w-8" />,
                title: "Sleep Optimization",
                description: "Detailed sleep cycle analysis with actionable insights for better recovery."
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "AI-Powered Coaching",
                description: "Personalized training recommendations based on your unique physiological data."
              },
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile-First Design",
                description: "Seamlessly integrated mobile app for iOS and Android with offline capabilities."
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Performance Analytics",
                description: "Deep insights into your training patterns and long-term progress tracking."
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="text-blue-400 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Integration Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Seamless <span className="text-blue-400">Device Integration</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect with your favorite wearables and fitness devices for comprehensive health tracking.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[
              { name: "WHOOP", logo: "🔴" },
              { name: "Apple Watch", logo: "⌚" },
              { name: "Garmin", logo: "🟦" },
              { name: "Fitbit", logo: "🟢" }
            ].map((device, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{device.logo}</div>
                <div className="text-gray-300 font-medium">{device.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Optimize Your Performance?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the community of elite athletes and fitness enthusiasts who trust Catalyft 
            to unlock their full potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Link to="/signup">Get Started Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          
          <div className="mt-8 flex justify-center items-center space-x-4 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>7-day free trial • No credit card required • Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;