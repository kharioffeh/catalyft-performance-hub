
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { Button } from '@/components/ui/button';
import { Activity, Shield, Calendar, BarChart3, Zap, Brain } from 'lucide-react';

const Home: React.FC = () => {
  // Vanta background effect
  const vantaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!vantaRef.current) return;
    const vanta = NET({
      el: vantaRef.current,
      THREE,
      color: 0x5e6ad2,
      backgroundColor: 0x101014,
      points: 8,
      maxDistance: 25,
      spacing: 20,
    });
    return () => vanta.destroy();
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-charcoal text-white font-[Inter]">
      {/* Background layers */}
      <div ref={vantaRef} className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-500 opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-blue-400" />
          <span className="ml-3 text-xl tracking-tight font-semibold">Catalyft AI</span>
        </div>

        <ul className="hidden md:flex space-x-10 text-sm text-gray-300">
          <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
          <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
          <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link></li>
        </ul>

        <Link to="/login">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
            Sign In
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="container mx-auto px-6 pt-20 md:pt-28 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AI-Powered</span>{" "}
          Performance Coaching
        </h1>
        <p className="text-gray-300 text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light">
          Optimize your training with intelligent insights from your wearable data, 
          personalized coaching plans, and advanced analytics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3">
              Start Free Trial
            </Button>
          </Link>
          <a href="#features" className="flex items-center text-gray-300 hover:text-white transition-colors">
            Learn more
            <BarChart3 className="ml-2 h-4 w-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 max-w-4xl mx-auto">
          {[
            ["10k+", "Athletes trained"],
            ["95%", "Performance improvement"],
            ["24/7", "AI monitoring"],
            ["100%", "Data-driven insights"],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-light mb-1 tracking-tight text-blue-400">{num}</p>
              <p className="text-gray-400 font-light">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Powerful features
              </span>{" "}
              for peak performance
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto font-light">
              Everything you need to monitor, analyze, and optimize athletic performance with cutting-edge AI technology.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_LIST.map(({ icon: IconComponent, title, desc, color }) => (
              <div
                key={title}
                className="bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 mb-6 rounded-lg flex items-center justify-center ${color} group-hover:opacity-80 transition-opacity`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">{title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
          <div className="absolute -top-32 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/5 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                What Athletes Say
              </span>
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto font-light">
              Real feedback from athletes and coaches who've transformed their performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300 flex flex-col items-center text-center"
              >
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mb-4 border-2 border-blue-400 shadow-lg"
                />
                <p className="text-lg text-white mb-4 font-light leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="mt-auto">
                  <span className="block text-blue-300 font-medium">{testimonial.name}</span>
                  <span className="block text-gray-400 text-sm">{testimonial.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-medium text-white mb-4">
            Ready to optimize your performance?
          </h2>
          <p className="text-gray-300 mb-6 font-light">
            Join thousands of athletes and coaches already using Catalyft AI.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

// Feature data with Lucide icons
const FEATURE_LIST = [
  {
    title: "Readiness Tracking",
    desc: "Monitor daily readiness with AI-powered insights from your wearable data and recovery metrics.",
    color: "bg-blue-500/10 text-blue-400",
    icon: Activity,
  },
  {
    title: "Risk Assessment",
    desc: "Prevent injuries with intelligent workload monitoring and predictive risk analysis.",
    color: "bg-purple-500/10 text-purple-400",
    icon: Shield,
  },
  {
    title: "Smart Scheduling",
    desc: "Optimize training schedules based on recovery data, performance goals, and athlete availability.",
    color: "bg-green-500/10 text-green-400",
    icon: Calendar,
  },
  {
    title: "Advanced Analytics",
    desc: "Visualize progress with comprehensive charts and personalized performance insights.",
    color: "bg-orange-500/10 text-orange-400",
    icon: BarChart3,
  },
  {
    title: "AI Performance Coach",
    desc: "Get personalized coaching recommendations powered by machine learning algorithms.",
    color: "bg-indigo-500/10 text-indigo-400",
    icon: Brain,
  },
  {
    title: "Real-time Optimization",
    desc: "Receive instant feedback and adjustments to maximize training effectiveness.",
    color: "bg-pink-500/10 text-pink-400",
    icon: Zap,
  },
];

// Testimonials data
const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    title: "Olympic Swimmer",
    quote: "Catalyft AI transformed my training completely. The readiness insights helped me avoid overtraining and achieve my personal best times.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5ab?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Marcus Rodriguez",
    title: "Professional Cyclist",
    quote: "The AI coaching recommendations are spot-on. My power output increased by 15% in just 3 months of using the platform.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Coach Jennifer Lee",
    title: "Track & Field Coach",
    quote: "Managing 20+ athletes became effortless with Catalyft. The risk assessment features have prevented countless injuries.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

export default Home;
