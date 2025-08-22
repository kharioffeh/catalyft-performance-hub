# 🔑 Setting Up ARIA API Keys

## Quick Setup (Recommended)

Run the interactive setup script:
```bash
cd /workspace/mobile
./scripts/setup-api-keys.sh
```

## Manual Setup

Edit the `.env` file directly:
```bash
cd /workspace/mobile
nano .env  # or use your preferred editor
```

Add your keys:
```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_ARIA_KEY=sk-optional-separate-key-for-aria

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

## Where to Get Your Keys

### 1. OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it (e.g., "ARIA Fitness Coach")
4. Copy the key (starts with `sk-`)
5. **Important**: Save it immediately, you can't see it again!

**Note**: Make sure your OpenAI account has:
- API credits (check at https://platform.openai.com/usage)
- GPT-4 access (for best results)

### 2. Supabase Keys
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL**: Under "Project URL"
   - **Anon/Public Key**: Under "Project API keys"

## Verify Your Setup

Run the verification script:
```bash
node scripts/verify-openai-setup.js
```

You should see:
```
✓ .env file
✓ OPENAI_API_KEY found: sk-proj...xxxx
✓ SUPABASE_URL: https://xxxxx.supabase.co
✓ SUPABASE_ANON_KEY: eyJhbGc...xxxx

✅ ARIA is ready to use!
```

## Test ARIA

1. Start the app:
```bash
npm run ios  # or npm run android
```

2. Navigate to ARIA chat

3. Send a test message:
   - "Hello ARIA, are you working?"
   - "What can you help me with?"
   - "Generate a quick chest workout"

## Troubleshooting

### "Invalid API Key" Error
- Check that your key starts with `sk-`
- Verify you copied the entire key
- Ensure no extra spaces or quotes

### "Rate Limit" Error
- Check your OpenAI usage/credits
- Consider upgrading your OpenAI plan
- Use GPT-3.5 instead of GPT-4 for testing

### "Network Error"
- Check internet connection
- Verify Supabase URL is correct
- Ensure no firewall blocking

### Still Not Working?
1. Check the logs:
```bash
npx react-native log-ios  # or log-android
```

2. Clear cache and rebuild:
```bash
npx react-native start --reset-cache
cd ios && pod install  # iOS only
npm run ios  # or android
```

## Security Notes

⚠️ **NEVER commit your .env file to git!**

The `.env` file is already in `.gitignore`, but double-check:
```bash
git status  # Should NOT show .env
```

## Using Environment Variables in Production

For production deployment:
1. Use environment variables in your CI/CD
2. Store keys in secure services (e.g., AWS Secrets Manager)
3. Never hardcode keys in your code

## Cost Optimization

To minimize OpenAI API costs:
1. Use GPT-3.5-turbo for testing
2. Set up usage limits in OpenAI dashboard
3. Consider using OPENAI_ARIA_KEY with separate billing
4. Monitor usage at https://platform.openai.com/usage

---

**Ready to go?** Run the verification script to confirm everything is set up correctly!