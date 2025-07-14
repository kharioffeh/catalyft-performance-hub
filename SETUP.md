# Environment Setup Guide

This guide will help you configure the required environment variables to run the health check successfully.

## Required Environment Variables

The following environment variables need to be set in your `.env` file:

### 1. Supabase Configuration (✅ Already configured)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 2. OpenAI API Keys (❌ Need to be configured)
- `OPENAI_API_KEY` - Standard OpenAI API key for general AI features
- `OPENAI_ARIA_KEY` - OpenAI API key specifically for ARIA coaching features

### 3. Ably API Key (❌ Need to be configured)
- `ABLY_API_KEY` - For realtime features and messaging

## How to Get API Keys

### OpenAI API Keys
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env` file
5. You can use the same key for both `OPENAI_API_KEY` and `OPENAI_ARIA_KEY`

### Ably API Key
1. Go to [Ably](https://ably.com/)
2. Sign up for a free account
3. Create a new app in your dashboard
4. Go to the "API Keys" tab
5. Copy your API key and add it to your `.env` file

## Configuration

Update your `.env` file with the actual API keys:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xeugyryfvilanoiethum.supabase.co
VITE_SUPABASE_ANON_KEY=your-existing-key-here

# OpenAI API Keys
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_ARIA_KEY=sk-your-openai-key-here

# Ably API Key
ABLY_API_KEY=your-ably-key-here

# Production Domain
VITE_APP_URL=https://catalyft.app
```

## Testing

After configuring the environment variables, run the health check:

```bash
node scripts/health-check.js
```

You should see:
- ✅ Environment Variables
- ✅ Edge Functions 
- ✅ Realtime Connectivity

## Troubleshooting

### Function Not Found Errors
If you get "Function not found" errors, make sure your Supabase project has the required Edge Functions deployed:
- `aria-generate-insights`
- `aria-generate-program`
- `aria-chat-proxy`
- `ai-sports-chat`

### Realtime Connectivity Issues
If realtime connectivity fails, check:
1. Your Supabase project has realtime enabled
2. Your network allows WebSocket connections
3. The anon key has proper permissions

### OpenAI API Issues
If OpenAI API calls fail:
1. Verify your API key is valid
2. Check your OpenAI account has sufficient credits
3. Ensure the key has the necessary permissions for chat completions

## Development vs Production

For development, you can use the same API keys for both `OPENAI_API_KEY` and `OPENAI_ARIA_KEY`. In production, you may want to use separate keys for better monitoring and billing separation.