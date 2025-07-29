# Sentry Integration Setup - COMPLETE ✅

## Overview
Sentry crash reporting has been successfully integrated into the React Native mobile app. The setup includes:

- ✅ `@sentry/react-native` package installed
- ✅ Sentry configuration added to `src/config.ts`
- ✅ Sentry initialization in `src/App.tsx`
- ✅ Environment variables configured for all environments
- ✅ Multi-environment support (development, staging, production)

## Files Modified/Created

### 1. **Package Dependencies**
- Added `@sentry/react-native@^6.19.0` to `package.json`

### 2. **Configuration Files**
- **`src/config.ts`**: Added `SENTRY_DSN` and `NODE_ENV` exports
- **`src/App.tsx`**: Added Sentry initialization at app startup

### 3. **Environment Files Created**
- **`.env`**: Development environment configuration
- **`.env.staging`**: Staging environment configuration  
- **`.env.production`**: Production environment configuration
- **`.env.example`**: Updated with all required variables

## Environment Variables

Each environment file includes these Sentry-specific variables:

```bash
# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
NODE_ENV=development  # or staging/production
```

## How to Complete the Setup

### Step 1: Create a Sentry Project
1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for React Native
3. Copy the DSN (Data Source Name) from your project settings

### Step 2: Update Environment Files
Replace the placeholder values in your environment files:

**For Development (`.env`):**
```bash
SENTRY_DSN=https://your-development-dsn@sentry.io/project-id
NODE_ENV=development
```

**For Staging (`.env.staging`):**
```bash
SENTRY_DSN=https://your-staging-dsn@sentry.io/project-id  
NODE_ENV=staging
```

**For Production (`.env.production`):**
```bash
SENTRY_DSN=https://your-production-dsn@sentry.io/project-id
NODE_ENV=production
```

### Step 3: Test the Integration

**Start the app in development:**
```bash
npm start
```

**Start the app in staging:**
```bash
npm run start:staging
```

**Start the app in production:**
```bash
npm run start:production
```

### Step 4: Verify Sentry is Working

**Option 1: Check Sentry Dashboard**
- After starting the app, check your Sentry dashboard
- You should see session tracking and basic telemetry

**Option 2: Test Crash Reporting**
Add a test crash to verify reporting works:

```typescript
// Add this button to your App.tsx for testing
import { Button } from 'react-native';

// In your component:
<Button 
  title="Test Crash" 
  onPress={() => {
    throw new Error('This is a test crash!');
  }} 
/>
```

**Option 3: Check Console Logs**
Look for Sentry initialization messages in your development console.

## Environment-Specific Features

### Development
- Detailed error information
- Source maps for debugging
- Local crash reporting

### Staging  
- Production-like crash reporting
- Performance monitoring
- Pre-release testing

### Production
- Optimized crash reporting
- Real user monitoring
- Release health tracking

## Code Structure

### Sentry Initialization
```typescript
// src/App.tsx
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.NODE_ENV,
});
```

### Configuration Export
```typescript
// src/config.ts
export const SENTRY_DSN = Config.SENTRY_DSN || '';
export const NODE_ENV = Config.NODE_ENV || 'development';

export const config = {
  // ... other config
  sentry: {
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
  },
};
```

## Additional Sentry Features (Optional)

Once basic setup is working, you can enhance with:

### 1. User Context
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
});
```

### 2. Custom Tags
```typescript
Sentry.setTag('feature', 'authentication');
```

### 3. Breadcrumbs
```typescript
Sentry.addBreadcrumb({
  message: 'User clicked login button',
  level: 'info',
});
```

### 4. Performance Monitoring
```typescript
const transaction = Sentry.startTransaction({
  name: 'API Call',
  op: 'http.client',
});
```

## Troubleshooting

### Common Issues

**1. "Sentry DSN not found"**
- Verify your `.env` file has the correct `SENTRY_DSN` value
- Check that the environment file is being loaded correctly

**2. "NODE_ENV not set"**
- Make sure `NODE_ENV` is defined in your environment file
- Verify babel.config.js is loading the correct .env file

**3. "No crashes appearing in Sentry"**
- Check your Sentry DSN is correct
- Verify network connectivity
- Test with a manual crash

**4. TypeScript errors**
- Run `npx tsc --noEmit` to check for type issues
- Ensure `@sentry/react-native` types are properly installed

### Debug Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Verify environment loading
npm start  # Check console for Config.SENTRY_DSN output

# Test different environments
npm run start:staging
npm run start:production
```

## Next Steps

1. **Replace placeholder DSN values** with your actual Sentry project DSNs
2. **Test crash reporting** in each environment
3. **Configure release tracking** in your CI/CD pipeline
4. **Set up performance monitoring** for production
5. **Create alerts** for critical errors in Sentry dashboard

## Security Notes

- ⚠️ Never commit actual API keys to version control
- ✅ Use different Sentry projects for different environments
- ✅ Environment files are properly gitignored
- ✅ Production DSN should be separate from development/staging

---

**Status**: ✅ SETUP COMPLETE - Ready for DSN configuration
**Last Updated**: $(date)
**Integration Version**: @sentry/react-native@^6.19.0