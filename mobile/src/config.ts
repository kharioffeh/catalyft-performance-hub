// Handle react-native-config import gracefully
let Config: any = {};
try {
  Config = require('react-native-config').default || {};
} catch (error) {
  // Fallback for when native modules aren't available (CI/testing)
  Config = process.env || {};
}

// Supabase configuration
export const SUPABASE_URL = Config.SUPABASE_URL || process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Ably configuration
export const ABLY_API_KEY = Config.ABLY_API_KEY || process.env.ABLY_API_KEY || '';

// OpenAI configuration
export const OPENAI_API_KEY = Config.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
export const OPENAI_ARIA_KEY = Config.OPENAI_ARIA_KEY || process.env.OPENAI_ARIA_KEY || '';

// Nutritionix configuration
export const NUTRITIONIX_APP_ID = Config.NUTRITIONIX_APP_ID || process.env.NUTRITIONIX_APP_ID || '';
export const NUTRITIONIX_API_KEY = Config.NUTRITIONIX_API_KEY || process.env.NUTRITIONIX_API_KEY || '';

// Google Fit configuration
export const GOOGLE_FIT_CLIENT_ID = Config.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_FIT_CLIENT_ID || '';

// Sentry configuration
export const SENTRY_DSN = Config.SENTRY_DSN || process.env.SENTRY_DSN || '';
export const NODE_ENV = Config.NODE_ENV || process.env.NODE_ENV || 'development';

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
  sentry: {
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
  },
  validateConfig,
};

export default config;