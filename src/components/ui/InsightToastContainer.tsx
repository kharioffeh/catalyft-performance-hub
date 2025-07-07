
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { InsightToast } from './InsightToast';
import { useInsightToasts } from '@/hooks/useInsightToasts';

export const InsightToastContainer: React.FC = () => {
  const { insights, dismissInsight } = useInsightToasts();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {insights.map(insight => (
          <InsightToast
            key={insight.id}
            insight={insight}
            onDismiss={dismissInsight}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
