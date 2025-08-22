# 🚀 Quick API Setup for ARIA

## Option 1: Interactive Setup (Recommended)

From your terminal, run ONE of these commands:

```bash
# If you're in the project root (/workspaces/catalyft-performance-hub)
cd mobile && ./setup-keys.sh

# OR from anywhere
/workspaces/catalyft-performance-hub/mobile/setup-keys.sh
```

## Option 2: Manual Setup

1. **Navigate to mobile directory:**
```bash
cd /workspaces/catalyft-performance-hub/mobile
```

2. **Edit the .env file:**
```bash
nano .env
```

3. **Add your keys (replace the placeholders):**
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_ARIA_KEY=sk-optional-separate-aria-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

4. **Save and exit:**
- Press `Ctrl+O` then `Enter` to save
- Press `Ctrl+X` to exit

## 🔑 Where to Get Your Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Copy the key (starts with `sk-`)

### Supabase Keys
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL (SUPABASE_URL)
   - Anon/Public key (SUPABASE_ANON_KEY)

## ✅ Verify Your Setup

```bash
cd /workspaces/catalyft-performance-hub/mobile
node scripts/verify-openai-setup.js
```

## 🎯 Test ARIA

1. **Start Metro:**
```bash
cd /workspaces/catalyft-performance-hub/mobile
npm start
```

2. **Run the app:**
```bash
# In a new terminal
npm run ios
# OR
npm run android
```

3. **Test ARIA:**
- Navigate to the ARIA chat screen
- Say: "Hello ARIA, how can you help me?"

## 🆘 Troubleshooting

If the setup script doesn't work, try:

```bash
# Make sure you're in the right directory
cd /workspaces/catalyft-performance-hub/mobile

# Check if .env exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Edit manually
nano .env
```

## 📝 Current Status

Your .env file should contain:
- ✅ OPENAI_API_KEY (required)
- ⭕ OPENAI_ARIA_KEY (optional)
- ✅ SUPABASE_URL (required)
- ✅ SUPABASE_ANON_KEY (required)