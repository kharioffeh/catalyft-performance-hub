declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    SENTRY_DSN?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Make process.env available globally
declare const process: {
  env: NodeJS.ProcessEnv;
};