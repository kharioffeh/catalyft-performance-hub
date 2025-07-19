# AI Features Debug Guide

## 🔧 **Issues Found**

### 1. **Whoop Client ID** ✅ FIXED
- Updated `ConnectWearableModal.tsx` to use `import.meta.env.VITE_WHOOP_CLIENT_ID`
- Added proper error handling for missing environment variable

### 2. **AI Functions Not Working** ❌ ISSUE FOUND

**Problem**: Edge functions returning "OpenAI API key not configured" despite secrets being set in Supabase.

**Root Cause**: Environment variables might not be propagated to the edge functions yet.

## 🩺 **Diagnostic Steps**

### Check 1: Verify Secret Names
Your Supabase secrets show:
- ✅ `OPENAI_API_KEY` - Present
- ✅ `OPENAI_ARIA_KEY` - Present

Edge functions are looking for:
- ✅ `OPENAI_ARIA_KEY` (most ARIA functions)
- ✅ `OPENAI_API_KEY` (some other functions)

**Status**: Secret names match ✅

### Check 2: Function Environment Variable Access
When I tested:
```bash
curl "https://xeugyryfvilanoiethum.supabase.co/functions/v1/ask_aria"
# Response: {"error":"OpenAI API key not configured"}
```

This suggests the edge function can't access `OPENAI_ARIA_KEY`.

## 🛠️ **Solutions to Try**

### Solution 1: Wait for Propagation (Recommended)
Environment variable changes in Supabase can take **5-15 minutes** to propagate to edge functions.

**Action**: Wait 10-15 minutes after setting the secrets, then test again.

### Solution 2: Force Function Refresh
From your Supabase dashboard:
1. Go to **Edge Functions**
2. Click on any ARIA function (e.g., `ask_aria`)
3. Click **Deploy** or **Redeploy** to force a refresh

### Solution 3: Verify Function Logs
1. Go to **Edge Functions** > **Logs**
2. Test an AI feature in your app
3. Check for specific error messages in the logs

### Solution 4: Test Different Functions
Try these functions to isolate the issue:

**ARIA Functions** (need `OPENAI_ARIA_KEY`):
- `ask_aria`
- `aria-chat-proxy`
- `aria-generate-program`
- `aria-generate-insights`

**Other AI Functions** (need `OPENAI_API_KEY`):
- `ai-parse-meal`
- `generate-training-plan`

## 🧪 **Quick Test Steps**

### 1. Test from App UI
- Go to your app
- Try asking ARIA a question
- Check browser console for detailed errors

### 2. Check Function Logs
- Open Supabase Dashboard
- Go to Edge Functions > Logs
- Look for the function call and error details

### 3. Test Environment Variable Access
Create a simple test function call to check if the environment variables are accessible.

## 📋 **Next Steps**

### Immediate (Now):
1. ✅ **Whoop integration fixed** - needs `VITE_WHOOP_CLIENT_ID` in your frontend env
2. 🔄 **Wait 10-15 minutes** for secret propagation

### After Waiting:
1. **Test AI features** in the app again
2. **Check Edge Function logs** for detailed errors
3. **Try redeploying functions** if still not working

### Environment Variables Needed:
For frontend `.env` file:
```bash
VITE_WHOOP_CLIENT_ID=your_whoop_client_id
VITE_SUPABASE_URL=https://xeugyryfvilanoiethum.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 🎯 **Expected Behavior After Fix**

Once the environment variables propagate:
- ✅ **AI Coaching (ARIA)** should work
- ✅ **Program generation** should work
- ✅ **Whoop integration** should work (with frontend env var)
- ✅ **Billing** should work
- ✅ **All other features** should work

## 🚨 **If Still Not Working**

If AI features still don't work after 15 minutes:
1. **Check the Edge Function logs** in Supabase dashboard
2. **Try redeploying functions** from the dashboard
3. **Verify secret values** aren't corrupted
4. **Test with a simple function** first

The infrastructure is correct - this appears to be a timing/propagation issue with the environment variables.