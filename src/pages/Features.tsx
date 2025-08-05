import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Moon, 
  Zap, 
  Smartphone, 
  TrendingUp,
  Brain,
  Shield,
  Clock,
  Target,
  BarChart3,
  Users2
} from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-400/30">
            🔬 Advanced Performance Technology
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Features Built for
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Elite Performance
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover how Catalyft's cutting-edge technology stack delivers actionable insights 
            to optimize every aspect of your training and recovery.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: <Activity className="h-12 w-12" />,
                title: "Real-Time Strain Monitoring",
                description: "Track your cardiovascular and muscular load with precision. Our advanced algorithms analyze heart rate variability, training intensity, and movement patterns to provide real-time feedback on your training strain.",
                features: [
                  "HRV-based strain calculation",
                  "Movement pattern analysis", 
                  "Personalized strain zones",
                  "Overtraining prevention alerts"
                ]
              },
              {
                icon: <Heart className="h-12 w-12" />,
                title: "Advanced Recovery Metrics",
                description: "Get comprehensive recovery insights that go beyond basic metrics. Our AI analyzes multiple biomarkers to determine your body's readiness for training.",
                features: [
                  "Multi-factor recovery scoring",
                  "Sleep quality impact analysis",
                  "Stress level monitoring",
                  "Personalized rest recommendations"
                ]
              },
              {
                icon: <Moon className="h-12 w-12" />,
                title: "Sleep Optimization",
                description: "Understand your sleep architecture with detailed cycle analysis. Get actionable recommendations to improve sleep quality and recovery.",
                features: [
                  "Sleep stage tracking",
                  "Sleep debt calculation",
                  "Optimal bedtime suggestions",
                  "Environmental factor analysis"
                ]
              },
              {
                icon: <Brain className="h-12 w-12" />,
                title: "AI-Powered Coaching",
                description: "Receive personalized training recommendations powered by machine learning algorithms trained on elite athlete data.",
                features: [
                  "Adaptive training plans",
                  "Performance prediction",
                  "Injury risk assessment",
                  "Goal-based periodization"
                ]
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 p-8">
                <CardHeader className="pb-4">
                  <div className="text-blue-400 mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl text-white mb-3">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-4 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Built on <span className="text-blue-400">Cutting-Edge Technology</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our technology stack combines hardware innovation with advanced software to deliver unparalleled insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile-First Platform",
                description: "Native iOS and Android apps with offline capabilities and real-time sync."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Privacy & Security",
                description: "End-to-end encryption and privacy-first data handling. Your data stays yours."
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Advanced Analytics",
                description: "Machine learning algorithms process millions of data points for personalized insights."
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Precision Tracking",
                description: "Multi-sensor fusion technology for the most accurate biometric measurements."
              },
              {
                icon: <Users2 className="h-8 w-8" />,
                title: "Community Features",
                description: "Connect with coaches and training partners while maintaining data privacy."
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Real-Time Processing",
                description: "Instant data processing and feedback for immediate training adjustments."
              }
            ].map((tech, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-400 mb-4 flex justify-center">{tech.icon}</div>
                  <h3 className="text-lg font-semibold mb-3 text-white">{tech.title}</h3>
                  <p className="text-gray-300 text-sm">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Compatibility */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Works with Your <span className="text-blue-400">Favorite Devices</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Seamlessly integrate with popular wearables and fitness devices for comprehensive health tracking.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {[
                { name: "WHOOP", description: "Full integration", logo: "🔴" },
                { name: "Apple Watch", description: "HealthKit sync", logo: "⌚" },
                { name: "Garmin", description: "Connect IQ", logo: "🟦" },
                { name: "Fitbit", description: "Data sync", logo: "🟢" }
              ].map((device, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl mb-3">{device.logo}</div>
                  <div className="text-white font-medium mb-1">{device.name}</div>
                  <div className="text-gray-400 text-sm">{device.description}</div>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Can't find your device? We're constantly adding new integrations.
              </p>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Request Integration
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Advanced Performance Tracking?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your journey with Catalyft and discover what elite performance feels like.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;