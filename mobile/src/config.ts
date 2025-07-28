import Config from 'react-native-config';

// Supabase configuration
export const SUPABASE_URL = Config.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || '';

// Ably configuration
export const ABLY_API_KEY = Config.ABLY_API_KEY || '';

// OpenAI configuration
export const OPENAI_API_KEY = Config.OPENAI_API_KEY || '';
export const OPENAI_ARIA_KEY = Config.OPENAI_ARIA_KEY || '';

// Validation function to check if all required environment variables are set
export const validateConfig = () => {
  const requiredVars = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    ABLY_API_KEY,
    OPENAI_API_KEY,
    OPENAI_ARIA_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}`
    );
    return false;
  }

  return true;
};

// Export all config as a single object for convenience
export const config = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  },
  ably: {
    apiKey: ABLY_API_KEY,
  },
  openai: {
    apiKey: OPENAI_API_KEY,
    ariaKey: OPENAI_ARIA_KEY,
  },
  validateConfig,
};

export default config;