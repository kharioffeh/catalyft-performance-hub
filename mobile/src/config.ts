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
export const GOOGLE_FIT_CLIENT_SECRET = Config.GOOGLE_FIT_CLIENT_SECRET || '';

// Amplitude Analytics configuration
export const AMPLITUDE_API_KEY = Config.AMPLITUDE_API_KEY || '';

// Wearable API configurations
export const WHOOP_CLIENT_ID = Config.WHOOP_CLIENT_ID || '';
export const WHOOP_CLIENT_SECRET = Config.WHOOP_CLIENT_SECRET || '';
export const GARMIN_CONSUMER_KEY = Config.GARMIN_CONSUMER_KEY || '';
export const GARMIN_CONSUMER_SECRET = Config.GARMIN_CONSUMER_SECRET || '';
export const FITBIT_CLIENT_ID = Config.FITBIT_CLIENT_ID || '';
export const FITBIT_CLIENT_SECRET = Config.FITBIT_CLIENT_SECRET || '';

// Apple HealthKit configuration
export const APPLE_HEALTHKIT_ENABLED = Config.APPLE_HEALTHKIT_ENABLED === 'true';

// App URL
export const APP_URL = Config.APP_URL || '';

// Sentry configuration
export const SENTRY_DSN = Config.SENTRY_DSN || '';
export const NODE_ENV = Config.NODE_ENV || 'development';

// Validation function to check if all required environment variables are set
export const validateConfig = () => {
  const requiredVars = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  };

  const optionalVars = {
    ABLY_API_KEY,
    OPENAI_API_KEY,
    OPENAI_ARIA_KEY,
    NUTRITIONIX_APP_ID,
    NUTRITIONIX_API_KEY,
    GOOGLE_FIT_CLIENT_ID,
    AMPLITUDE_API_KEY,
    WHOOP_CLIENT_ID,
    GARMIN_CONSUMER_KEY,
    FITBIT_CLIENT_ID,
  };

  const missingRequired = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  const missingOptional = Object.entries(optionalVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingRequired.length > 0) {
    console.error(
      `❌ Missing REQUIRED environment variables: ${missingRequired.join(', ')}`
    );
    return false;
  }

  if (missingOptional.length > 0) {
    console.warn(
      `⚠️ Missing optional environment variables: ${missingOptional.join(', ')}`
    );
  }

  const configuredCount = Object.keys(optionalVars).length - missingOptional.length;
  console.log(`✅ ${configuredCount}/${Object.keys(optionalVars).length} optional API keys configured`);

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
    clientSecret: GOOGLE_FIT_CLIENT_SECRET,
  },
  amplitude: {
    apiKey: AMPLITUDE_API_KEY,
  },
  wearables: {
    whoop: {
      clientId: WHOOP_CLIENT_ID,
      clientSecret: WHOOP_CLIENT_SECRET,
    },
    garmin: {
      consumerKey: GARMIN_CONSUMER_KEY,
      consumerSecret: GARMIN_CONSUMER_SECRET,
    },
    fitbit: {
      clientId: FITBIT_CLIENT_ID,
      clientSecret: FITBIT_CLIENT_SECRET,
    },
    apple: {
      healthKitEnabled: APPLE_HEALTHKIT_ENABLED,
    },
  },
  app: {
    url: APP_URL,
  },
  sentry: {
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
  },
  validateConfig,
};

export default config;