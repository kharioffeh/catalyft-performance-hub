# Environment Variables Setup Guide

## From Supabase Secrets to Local Environment

Based on your Supabase Edge Functions secrets, here's how to configure your environment variables:

### 1. Update Your Local `.env` File

Replace the placeholders in your `.env` file with actual values from your Supabase secrets:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xeugyryfvilanoiethum.supabase.co
VITE_SUPABASE_ANON_KEY=<copy SUPABASE_ANON_KEY from your Supabase secrets>

# OpenAI API Keys  
OPENAI_API_KEY=<copy OPENAI_API_KEY from your Supabase secrets>
OPENAI_ARIA_KEY=<copy OPENAI_ARIA_KEY from your Supabase secrets>
OPENAI_KAI_KEY=<copy OPENAI_KAI_KEY from your Supabase secrets>

# Ably API Key (you'll need to create this)
ABLY_API_KEY=<get this from https://ably.com after creating an account>

# Production Domain
VITE_APP_URL=https://catalyft.app
```

### 2. Get Missing ABLY_API_KEY

You need to create an Ably account and get an API key:

1. Go to https://ably.com
2. Sign up for a free account
3. Create a new app
4. Copy the API key from your app dashboard
5. Add it to both your `.env` file and Supabase secrets

### 3. Add Secrets to GitHub Actions

Add these secrets to your GitHub repository at:
`https://github.com/kharioffeh/catalyft-performance-hub/settings/secrets/actions`

Required secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`  
- `OPENAI_API_KEY`
- `OPENAI_ARIA_KEY`
- `OPENAI_KAI_KEY`
- `ABLY_API_KEY`
- `SUPABASE_ACCESS_TOKEN` (for deployment)

### 4. Copy Values from Supabase

From your Supabase Edge Functions → Secrets, copy these values:

| Supabase Secret Name | Use For |
|---------------------|---------|
| `SUPABASE_URL` | `VITE_SUPABASE_URL` in .env and GitHub |
| `SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` in .env and GitHub |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` in .env and GitHub |
| `OPENAI_ARIA_KEY` | `OPENAI_ARIA_KEY` in .env and GitHub |
| `OPENAI_KAI_KEY` | `OPENAI_KAI_KEY` in .env and GitHub |

### 5. Test the Configuration

After updating your `.env` file, test it locally:

```bash
node scripts/health-check.js
```

You should see all environment variable checks pass.