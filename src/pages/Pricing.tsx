import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Essential",
      price: "$29",
      period: "/month",
      description: "Perfect for fitness enthusiasts getting started with performance tracking",
      features: [
        "Basic strain and recovery metrics",
        "Sleep tracking and analysis",
        "Mobile app access",
        "7-day data history",
        "Email support",
        "Community access"
      ],
      buttonText: "Start Essential",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Performance",
      price: "$49",
      period: "/month", 
      description: "Advanced features for serious athletes and coaches",
      features: [
        "All Essential features",
        "Advanced HRV analysis",
        "Personalized training recommendations",
        "30-day data history",
        "Wearable device integrations",
        "Priority support",
        "Training load optimization",
        "Injury risk assessment"
      ],
      buttonText: "Start Performance",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Elite",
      price: "$99",
      period: "/month",
      description: "Complete performance optimization for elite athletes and teams",
      features: [
        "All Performance features",
        "Unlimited data history",
        "AI-powered coaching insights",
        "Team dashboard (up to 10 athletes)",
        "Custom integrations",
        "24/7 phone support",
        "Performance benchmarking",
        "Advanced analytics suite",
        "Dedicated account manager"
      ],
      buttonText: "Start Elite",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  const annualDiscount = 20;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-400/30">
            💎 Transparent Pricing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Choose Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Performance Plan
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock your potential with plans designed for every level of athlete. 
            Start with a 7-day free trial, no credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <div className="mb-4">
                    {plan.name === 'Essential' && <Zap className="w-8 h-8 text-green-400 mx-auto" />}
                    {plan.name === 'Performance' && <Crown className="w-8 h-8 text-blue-400 mx-auto" />}
                    {plan.name === 'Elite' && <Star className="w-8 h-8 text-purple-400 mx-auto" />}
                  </div>
                  
                  <CardTitle className="text-2xl text-white mb-2">{plan.name}</CardTitle>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Save {annualDiscount}% with annual billing
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-300">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    asChild 
                    variant={plan.buttonVariant}
                    className={`w-full py-3 ${
                      plan.buttonVariant === 'default' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Link to="/signup">{plan.buttonText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="px-4 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Compare <span className="text-blue-400">All Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              See exactly what's included in each plan to find the perfect fit for your needs.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left p-6 text-white font-medium">Features</th>
                    <th className="text-center p-6 text-white font-medium">Essential</th>
                    <th className="text-center p-6 text-white font-medium">Performance</th>
                    <th className="text-center p-6 text-white font-medium">Elite</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[
                    { feature: "Basic strain tracking", essential: true, performance: true, elite: true },
                    { feature: "Sleep analysis", essential: true, performance: true, elite: true },
                    { feature: "Mobile app access", essential: true, performance: true, elite: true },
                    { feature: "Advanced HRV analysis", essential: false, performance: true, elite: true },
                    { feature: "Wearable integrations", essential: false, performance: true, elite: true },
                    { feature: "Training recommendations", essential: false, performance: true, elite: true },
                    { feature: "AI coaching insights", essential: false, performance: false, elite: true },
                    { feature: "Team dashboard", essential: false, performance: false, elite: true },
                    { feature: "24/7 phone support", essential: false, performance: false, elite: true },
                  ].map((row, index) => (
                    <tr key={index} className="border-t border-gray-700/50">
                      <td className="p-6 font-medium">{row.feature}</td>
                      <td className="p-6 text-center">
                        {row.essential ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : '—'}
                      </td>
                      <td className="p-6 text-center">
                        {row.performance ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : '—'}
                      </td>
                      <td className="p-6 text-center">
                        {row.elite ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is there a free trial?",
                answer: "Yes! All plans include a 7-day free trial with no credit card required. You can explore all features before committing."
              },
              {
                question: "Can I change plans anytime?",
                answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing."
              },
              {
                question: "What wearable devices are supported?",
                answer: "We support WHOOP, Apple Watch, Garmin, Fitbit, and many other popular fitness wearables. Check our features page for the complete list."
              },
              {
                question: "Is my data secure?",
                answer: "Yes. We use end-to-end encryption and follow strict privacy protocols. Your health data is never shared or sold to third parties."
              },
              {
                question: "Do you offer team discounts?",
                answer: "Yes! Elite plans include team features, and we offer custom pricing for larger organizations. Contact our sales team for details."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-gray-800/30 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Optimize Your Performance?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of athletes who've transformed their training with Catalyft.
          </p>
          
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
            <Link to="/signup">Start Your Free Trial</Link>
          </Button>
          
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • Cancel anytime • 7-day free trial
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;