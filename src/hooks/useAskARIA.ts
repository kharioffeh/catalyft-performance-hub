
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ARIAResponse {
  answer: string;
  sources?: Array<{ title: string; source: string }>;
}

export const useAskARIA = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askARIA = async (prompt: string, context?: string): Promise<ARIAResponse | null> => {
    if (!prompt.trim()) {
      setError('Prompt is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ask_aria', {
        body: {
          prompt,
          context: context || ''
        }
      });

      if (functionError) {
        console.error('Ask ARIA error:', functionError);
        setError(functionError.message || 'Failed to get response from ARIA');
        return null;
      }

      return data as ARIAResponse;
    } catch (err) {
      console.error('Error calling Ask ARIA:', err);
      setError('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const seedDocuments = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('seed_aria_docs');

      if (functionError) {
        console.error('Seed documents error:', functionError);
        setError(functionError.message || 'Failed to seed documents');
        return false;
      }

      console.log('Documents seeded:', data);
      return true;
    } catch (err) {
      console.error('Error seeding documents:', err);
      setError('An unexpected error occurred while seeding documents');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    askARIA,
    seedDocuments,
    isLoading,
    error
  };
};
