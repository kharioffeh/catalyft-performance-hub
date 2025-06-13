
import React from 'react';
import { AIChatInterface } from '@/components/AIChatInterface';
import { GlassContainer } from '@/components/Glass/GlassContainer';

const Chat: React.FC = () => {
  return (
    <div className="space-y-6">
      <GlassContainer>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">ARIA (Athlete Readiness & Insight Advocate)</h1>
            <p className="text-white/70 mt-2">
              Get intelligent insights and recommendations based on your training data
            </p>
          </div>
        </div>
      </GlassContainer>

      <div className="max-w-4xl mx-auto">
        <GlassContainer padding="lg">
          <AIChatInterface />
        </GlassContainer>
      </div>
    </div>
  );
};

export default Chat;
