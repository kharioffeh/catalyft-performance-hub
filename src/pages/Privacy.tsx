
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Catalyft AI</h1>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Catalyft AI ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our performance coaching platform. We are committed to protecting your privacy and ensuring the security of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Name and email address</li>
                  <li>User role (coach or athlete)</li>
                  <li>Account credentials</li>
                </ul>
                
                <h3 className="text-lg font-medium">Wearable Device Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>WHOOP recovery metrics (recovery score, heart rate variability, resting heart rate)</li>
                  <li>Sleep and activity data</li>
                  <li>Physiological measurements (SpO2, skin temperature)</li>
                </ul>

                <h3 className="text-lg font-medium">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Log data and analytics</li>
                  <li>Training session information</li>
                  <li>Calendar and scheduling data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and maintain our performance coaching services</li>
                <li>Facilitate coach-athlete relationships and data sharing</li>
                <li>Sync and analyze wearable device data for performance insights</li>
                <li>Send important notifications about your account and services</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Coach-Athlete Relationship:</strong> Athletes' data is shared with their designated coaches for performance coaching purposes</li>
                <li><strong>Third-Party Integrations:</strong> With your consent, we integrate with WHOOP and other wearable devices to sync your data</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Service Providers:</strong> With trusted service providers who assist in operating our platform (all bound by confidentiality agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Your Rights and Choices</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Update:</strong> Correct or update your information through your account settings</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Disconnect:</strong> Revoke access to connected wearable devices at any time</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Third-Party Integrations</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform integrates with WHOOP and potentially other wearable device providers. These integrations are governed by their respective privacy policies. We recommend reviewing the privacy policies of any third-party services you connect to our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legitimate business purposes or legal requirements even after account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="font-medium">Catalyft AI Support</p>
                <p>Email: privacy@catalyft.ai</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
