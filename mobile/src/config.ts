import Config from 'react-native-config';

// Supabase configuration
export const SUPABASE_URL = Config.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || '';

// Ably configuration
export const ABLY_API_KEY = Config.ABLY_API_KEY || '';

// OpenAI configuration
export const OPENAI_API_KEY = Config.OPENAI_API_KEY || '';
export const OPENAI_ARIA_KEY = Config.OPENAI_ARIA_KEY || '';

// Nutritionix configuration
export const NUTRITIONIX_APP_ID = Config.NUTRITIONIX_APP_ID || '';
export const NUTRITIONIX_API_KEY = Config.NUTRITIONIX_API_KEY || '';

// Google Fit configuration
export const GOOGLE_FIT_CLIENT_ID = Config.GOOGLE_FIT_CLIENT_ID || '';

// Validation function to check if all required environment variables are set
export const validateConfig = () => {
  const requiredVars = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    ABLY_API_KEY,
    OPENAI_API_KEY,
    OPENAI_ARIA_KEY,
    NUTRITIONIX_APP_ID,
    NUTRITIONIX_API_KEY,
    GOOGLE_FIT_CLIENT_ID,
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
  nutritionix: {
    appId: NUTRITIONIX_APP_ID,
    apiKey: NUTRITIONIX_API_KEY,
  },
  googleFit: {
    clientId: GOOGLE_FIT_CLIENT_ID,
  },
  validateConfig,
};

export default config;