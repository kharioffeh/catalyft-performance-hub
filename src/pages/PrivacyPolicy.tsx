import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-charcoal text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <Activity className="h-8 w-8 text-blue-400" />
          <span className="ml-3 text-xl tracking-tight font-semibold">Catalyft AI</span>
        </div>
        
        <Link to="/">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
          Privacy Policy
        </h1>
        
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 space-y-8">
          <div className="text-sm text-gray-400 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </div>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This may include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Personal information (name, email address, profile information)</li>
              <li>Health and fitness data from connected wearable devices</li>
              <li>Training and performance metrics</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">2. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Generate personalized coaching recommendations</li>
              <li>Analyze performance trends and insights</li>
              <li>Communicate with you about your account and our services</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">3. Data Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">5. Third-Party Integrations</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our platform integrates with third-party services, including fitness wearables and health platforms 
              such as Garmin. When you connect these services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>We only access data you explicitly authorize</li>
              <li>Data is used solely for providing our coaching services</li>
              <li>You can revoke access at any time through your account settings</li>
              <li>Third-party services have their own privacy policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of certain communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">7. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not directed to children under 13. We do not knowingly collect personal 
              information from children under 13. If you become aware that a child has provided us with 
              personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">8. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-4 text-blue-400">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this privacy policy or our practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white font-medium">Catalyft AI</p>
              <p className="text-gray-300">Email: privacy@catalyft.app</p>
              <p className="text-gray-300">Web: catalyft.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;