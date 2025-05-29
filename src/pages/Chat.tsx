
import React from 'react';
import { AIChatInterface } from '@/components/AIChatInterface';

const Chat: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach ARIA</h1>
          <p className="text-gray-600 mt-2">
            Get intelligent insights and recommendations based on your training data
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <AIChatInterface />
      </div>
    </div>
  );
};

export default Chat;
