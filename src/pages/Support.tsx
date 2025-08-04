import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  HelpCircle,
  MessageCircle,
  Book,
  Settings,
  Smartphone,
  Activity,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const categories = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Getting Started",
      description: "Setup, installation, and first steps",
      count: 12
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Device Integration",
      description: "Wearables, sync, and data collection",
      count: 18
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Account & Billing",
      description: "Subscriptions, payments, and settings",
      count: 8
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Features & Training",
      description: "App features, workouts, and analytics",
      count: 24
    }
  ];

  const faqs = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I get started with Catalyft?',
      answer: 'Download the mobile app for iOS or Android, create an account, and follow the onboarding process. You can connect your wearable devices during setup or add them later in settings.'
    },
    {
      id: '2',
      category: 'Device Integration',
      question: 'Which wearable devices are supported?',
      answer: 'Catalyft supports WHOOP, Apple Watch, Garmin, Fitbit, and many other popular fitness wearables. Full integration features are available in the mobile app.'
    },
    {
      id: '3',
      category: 'Account & Billing',
      question: 'Can I change my subscription plan?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately with prorated billing.'
    },
    {
      id: '4',
      category: 'Features & Training',
      question: 'How does the AI coaching work?',
      answer: 'Our AI analyzes your biometric data, training history, and recovery metrics to provide personalized training recommendations. The more data you provide, the more accurate the insights become.'
    },
    {
      id: '5',
      category: 'Device Integration',
      question: 'Why is my device not syncing?',
      answer: 'Check that Bluetooth is enabled, your device is charged, and you have the latest app version. Try disconnecting and reconnecting the device in settings.'
    },
    {
      id: '6',
      category: 'Account & Billing',
      question: 'Is there a free trial?',
      answer: 'Yes! All plans include a 7-day free trial with no credit card required. You can explore all features before committing to a subscription.'
    },
    {
      id: '7',
      category: 'Features & Training',
      question: 'What is strain monitoring?',
      answer: 'Strain monitoring measures your cardiovascular and muscular load throughout the day. It helps you understand training intensity and avoid overtraining.'
    },
    {
      id: '8',
      category: 'Getting Started',
      question: 'Do I need a wearable device to use Catalyft?',
      answer: 'While wearable devices enhance the experience significantly, you can start with manual data entry and upgrade later. The mobile app includes manual logging features.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-400/30">
            💬 Help Center
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            How Can We
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Help You?
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Find answers to common questions, browse our knowledge base, or get in touch with our support team.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-lg bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-400 mb-4 flex justify-center">{category.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{category.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{category.description}</p>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {category.count} articles
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Frequently Asked <span className="text-blue-400">Questions</span>
          </h2>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="bg-gray-800/30 border-gray-700">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                        {faq.category}
                      </Badge>
                      <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                    </div>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === faq.id && (
                  <CardContent className="pt-0">
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or browse by category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-900/30 to-cyan-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Our support team is here to help you get the most out of Catalyft.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
                <p className="text-gray-300 text-sm mb-4">Get instant help from our support team</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                <p className="text-gray-300 text-sm mb-4">Send us a detailed message</p>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Response time: Within 24 hours • Available 24/7 for Elite plan members
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;