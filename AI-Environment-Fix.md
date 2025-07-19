# 🔧 AI Environment Variable Fix Guide

## 🚨 **Issue Confirmed**

**Error**: `Error: OpenAI API key not configured` in `aria-generate-program` function
**Root Cause**: Edge functions cannot access `OPENAI_ARIA_KEY` environment variable despite it being set in Supabase secrets.

## 📋 **Your Current Setup**
✅ Secrets correctly configured in Supabase:
- `OPENAI_ARIA_KEY` - Set (14 Jul 2025 13:22:58)
- `OPENAI_API_KEY` - Set (14 Jul 2025 13:22:58)
- `WHOOP_CLIENT_ID` - Set
- `WHOOP_CLIENT_SECRET` - Set
- `STRIPE_SECRET_KEY` - Set

❌ Edge functions not accessing environment variables

## 🛠️ **Solutions (Try in Order)**

### Solution 1: Force Function Redeployment (RECOMMENDED)

**From Supabase Dashboard:**
1. Go to **Edge Functions** in your Supabase dashboard
2. Find the `aria-generate-program` function
3. Click on it, then click **Deploy** or **Redeploy**
4. Wait 2-3 minutes for deployment
5. Test the AI feature again

**Why this works**: Forces the function to pick up the latest environment variables.

### Solution 2: Restart All ARIA Functions

**Redeploy these functions in order:**
1. `aria-generate-program`
2. `ask_aria`
3. `aria-chat-proxy`
4. `aria-generate-insights`
5. `aria-chat-and-log`

### Solution 3: Check Secret Propagation Time

**Environment variables can take up to 30 minutes to propagate in some cases.**

**Check timing:**
- Secrets updated: 14 Jul 2025 13:22:58
- Current time: Check if 30+ minutes have passed
- If not, wait a bit longer

### Solution 4: Verify Secret Values

**In Supabase Dashboard:**
1. Go to **Project Settings** > **API Keys**
2. Click on each secret to verify:
   - `OPENAI_ARIA_KEY` starts with `sk-` 
   - No extra spaces or characters
   - Value is complete

### Solution 5: Check Function Logs

**To get detailed error info:**
1. Go to **Edge Functions** > **Logs**
2. Try using the AI feature
3. Look for the exact error message
4. Check if there are permission issues

## 🧪 **Test After Each Solution**

After trying each solution, test by:
1. Going to your app
2. Trying to generate a program with ARIA
3. Checking if you get a different error or if it works

## 🎯 **Expected Successful Response**

When working, the `aria-generate-program` function should:
1. Accept the request
2. Call OpenAI API successfully
3. Return a structured training program JSON

## 🚨 **If Still Not Working**

### Advanced Debugging:

1. **Check Edge Function Logs**:
   - Look for detailed error messages
   - Check if there are other issues (rate limits, API quotas)

2. **Verify OpenAI API Key**:
   - Test the key directly with OpenAI API
   - Check if it has sufficient credits
   - Verify it has access to the required models

3. **Test with Different Function**:
   - Try `ask_aria` function instead
   - If that works, issue is specific to `aria-generate-program`

## 🔄 **Alternative Temporary Fix**

If redeployment doesn't work immediately, you can try:

1. **Update the function code** to add more debugging
2. **Add console.log** to check environment variable values
3. **Deploy with explicit error handling**

## 📝 **Quick Test Commands**

Once you think it's fixed, test with:

```bash
# Test the specific function that was failing
curl -X POST "https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria-generate-program" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"athlete_uuid":"test","coach_uuid":"test","goal":"strength","weeks":4}'
```

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ No "OpenAI API key not configured" error
- ✅ Function returns structured JSON program
- ✅ AI features work in your app UI
- ✅ ARIA can generate programs and answer questions

## 📞 **Next Steps**

1. **Try Solution 1** (redeploy functions) first
2. **Wait 5 minutes** and test
3. **Check function logs** if still failing
4. **Move to Solution 2** if needed

The issue is definitely environment variable access - your setup is correct, just needs propagation/refresh!