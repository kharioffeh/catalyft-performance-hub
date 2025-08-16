# 🔐 Supabase Secrets - How to Access Your API Keys

## ✅ ALL API KEYS ARE AVAILABLE IN SUPABASE!

You have ALL the necessary API keys stored securely in Supabase Vault. Here's what's available:

### Available Secrets:
1. ✅ **SUPABASE_URL** - Database URL
2. ✅ **SUPABASE_ANON_KEY** - Public API key  
3. ✅ **SUPABASE_SERVICE_ROLE_KEY** - Admin key
4. ✅ **OPENAI_API_KEY** - OpenAI API access
5. ✅ **OPENAI_ARIA_KEY** - OpenAI ARIA model access
6. ✅ **ABLY_API_KEY** - Real-time messaging
7. ✅ **NUTRITIONIX_API_KEY** - Food database API
8. ✅ **NUTRITIONIX_APP_ID** - Nutritionix app identifier
9. ✅ **STRIPE_SECRET_KEY** - Payment processing
10. ✅ **WHOOP_CLIENT_ID** - WHOOP integration
11. ✅ **WHOOP_CLIENT_SECRET** - WHOOP auth

## 🔓 How to Access These Secrets

### Option 1: Via Supabase Dashboard (Easiest)
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → Vault**
4. Click on each secret to reveal the actual value
5. Copy the decrypted values

### Option 2: Via Supabase CLI
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xeugyryfvilanoiethum

# Retrieve secrets
supabase secrets list
supabase secrets get OPENAI_API_KEY
supabase secrets get ABLY_API_KEY
# etc...
```

### Option 3: Via SQL Query (in Supabase SQL Editor)
```sql
-- Run this in your Supabase SQL Editor
SELECT 
  name,
  decrypted_secret
FROM vault.decrypted_secrets
WHERE name IN (
  'OPENAI_API_KEY',
  'OPENAI_ARIA_KEY', 
  'ABLY_API_KEY',
  'NUTRITIONIX_API_KEY',
  'NUTRITIONIX_APP_ID'
);
```

## 📝 Update Your Mobile .env File

Once you have the decrypted values, update `/workspace/mobile/.env`:

```env
# Environment Configuration
NODE_ENV=development

# Supabase Configuration (Already set!)
SUPABASE_URL=https://xeugyryfvilanoiethum.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk

# Add these from Supabase Vault:
ABLY_API_KEY=[decrypt from vault]
OPENAI_API_KEY=[decrypt from vault]
OPENAI_ARIA_KEY=[decrypt from vault]
NUTRITIONIX_APP_ID=[decrypt from vault]
NUTRITIONIX_API_KEY=[decrypt from vault]

# Optional (for future features)
WHOOP_CLIENT_ID=[decrypt from vault]
WHOOP_CLIENT_SECRET=[decrypt from vault]
STRIPE_SECRET_KEY=[decrypt from vault]
```

## 🚀 Quick Steps to Get Running

1. **Access Supabase Dashboard**
   ```
   https://app.supabase.com/project/xeugyryfvilanoiethum/settings/vault
   ```

2. **Click on each secret** to reveal its value

3. **Update mobile/.env** with the revealed values

4. **Build your app**
   ```bash
   cd mobile
   eas build --platform android --profile preview
   ```

## 🔒 Security Notes

- The encrypted values shown (like `195188b449b1ee4e11d358da609a382e843faa490405a36e29a2ee0c431933a5`) are SHA-256 hashes
- You need to access Supabase Vault to get the actual decrypted values
- Never commit the decrypted values to Git
- Use environment variables or secure secret management

## 💡 Why The Values Appear Encrypted

Supabase Vault stores secrets encrypted at rest. The values you see are encrypted representations. To use them in your app, you need to:
1. Decrypt them via Supabase Dashboard/CLI
2. Add the decrypted values to your .env file
3. The app will then read them via react-native-config

## ✨ Once Configured

With all these API keys properly set, your app will have:
- ✅ **AI Coaching** (OpenAI)
- ✅ **Real-time sync** (Ably)
- ✅ **Food tracking** (Nutritionix)
- ✅ **Payment processing** (Stripe)
- ✅ **Fitness tracking** (WHOOP)
- ✅ **Full database** (Supabase)

---

**Action Required**: Access your Supabase Vault to get the decrypted API keys!