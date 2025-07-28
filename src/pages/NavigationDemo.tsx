import React from 'react';
import Navigation from '../components/Navigation';
import { BrowserRouter } from 'react-router-dom';

// Example page content
const DemoPageContent = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-100 mb-6">Navigation Demo</h1>
    
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Navigation Features</h2>
      <ul className="space-y-2 text-gray-300">
        <li>• <strong>Desktop:</strong> Permanent sidebar with all navigation links</li>
        <li>• <strong>Mobile:</strong> Collapsible drawer (triggered by hamburger menu) + bottom tabs</li>
        <li>• <strong>Responsive:</strong> Automatically switches between desktop and mobile layouts at 768px</li>
        <li>• <strong>Active States:</strong> Highlights current page in both drawer and tabs</li>
        <li>• <strong>Icons:</strong> Uses Lucide React icons for consistent styling</li>
      </ul>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">Available Routes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-300 mb-2">Main Navigation:</h3>
          <ul className="space-y-1 text-gray-400">
            <li>• Dashboard (/dashboard)</li>
            <li>• Training Plan (/training-plan)</li>
            <li>• Analytics (/analytics)</li>
            <li>• Calendar (/calendar)</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-300 mb-2">Additional Pages:</h3>
          <ul className="space-y-1 text-gray-400">
            <li>• Athletes (/athletes)</li>
            <li>• Chat (/chat)</li>
            <li>• Settings (/settings)</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-gray-200 mb-4">How to Use</h2>
      <div className="space-y-4 text-gray-300">
        <div>
          <h3 className="font-semibold mb-2">1. Wrap your app with Navigation:</h3>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            <code>{`import Navigation from './components/Navigation';

function App() {
  return (
    <Navigation>
      {/* Your app content goes here */}
      <YourAppRoutes />
    </Navigation>
  );
}`}</code>
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">2. Or wrap individual pages:</h3>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            <code>{`function DashboardPage() {
  return (
    <Navigation>
      <DashboardContent />
    </Navigation>
  );
}`}</code>
          </pre>
        </div>

        <div>
          <h3 className="font-semibold mb-2">3. Use the mobile detection hook:</h3>
          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
            <code>{`import { useIsMobile } from './components/Navigation';

function MyComponent() {
  const isMobile = useIsMobile();
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  </div>
);

// Demo with Navigation
const NavigationDemo = () => {
  return (
    <BrowserRouter>
      <Navigation>
        <DemoPageContent />
      </Navigation>
    </BrowserRouter>
  );
};

export default NavigationDemo;