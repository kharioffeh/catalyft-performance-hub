# Edge Function Environment Variables Setup

## ✅ **Fixed Environment Variable Issues**

I've updated the `aria-generate-insights` function to use the correct environment variables:

### **Changes Made:**
1. ✅ **OpenAI Key**: Now uses `OPENAI_ARIA_KEY` (consistent with other ARIA functions)
2. ✅ **Fallback**: Falls back to `OPENAI_API_KEY` if `OPENAI_ARIA_KEY` not found
3. ✅ **Supabase Variables**: Uses correct Edge Function variable names

## 🔧 **Environment Variables for Edge Functions**

Edge Functions **DO NOT** use your local `.env` file. You need to set environment variables in the **Supabase Dashboard**.

### **Required Variables:**

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `OPENAI_ARIA_KEY` | OpenAI API key for ARIA functions | Supabase Dashboard |
| `SUPABASE_URL` | Automatically available | ✅ Auto-provided |
| `SUPABASE_SERVICE_ROLE_KEY` | Automatically available | ✅ Auto-provided |

## 🚀 **How to Set Environment Variables**

### **Method 1: Supabase Dashboard (Recommended)**

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/xeugyryfvilanoiethum)
2. Navigate to **Settings** → **Edge Functions**
3. Click **Environment Variables**
4. Add:
   ```
   OPENAI_ARIA_KEY = sk-your-actual-openai-key-here
   ```

### **Method 2: Supabase CLI**

```bash
# Set environment variable via CLI
supabase secrets set OPENAI_ARIA_KEY=sk-your-actual-openai-key-here

# List all secrets
supabase secrets list

# Deploy function with secrets
supabase functions deploy aria-generate-insights
```

### **Method 3: Deploy with Environment Variable**

```bash
# Deploy with environment variable
supabase functions deploy aria-generate-insights --env-file .env.edge

# Where .env.edge contains:
# OPENAI_ARIA_KEY=sk-your-actual-key-here
```

## 🔍 **Verify Environment Variables**

### **Test if Variables are Available:**

Add this temporary debug endpoint to test:

```typescript
// Add this to your function for testing
console.log('OPENAI_ARIA_KEY available:', !!Deno.env.get('OPENAI_ARIA_KEY'));
console.log('SUPABASE_URL available:', !!Deno.env.get('SUPABASE_URL'));
```

### **Check Function Logs:**

1. Go to **Edge Functions** → **aria-generate-insights** → **Logs**
2. Test the function
3. Look for console.log output

## 🎯 **Current Function Configuration**

The function now tries environment variables in this order:

```typescript
// 1st priority: OPENAI_ARIA_KEY (consistent with other ARIA functions)
// 2nd priority: OPENAI_API_KEY (fallback)
const openAIApiKey = Deno.env.get('OPENAI_ARIA_KEY') || Deno.env.get('OPENAI_API_KEY');
```

## ⚠️ **Common Issues & Solutions**

### **Issue: "OPENAI_ARIA_KEY not set" Error**
**Solution:** Set the environment variable in Supabase Dashboard

### **Issue: Function works locally but not deployed**
**Solution:** Local `.env` file is ignored by Edge Functions - use Dashboard

### **Issue: API quota exceeded**
**Solution:** Check your OpenAI account billing and usage

### **Issue: Database insert failed**
**Solution:** Ensure `aria_insights` table exists (see TEST-ARIA-INSIGHTS.md)

## 🧪 **Test the Fixed Function**

1. **Deploy updated function:**
   ```bash
   supabase functions deploy aria-generate-insights
   ```

2. **Set environment variable in Dashboard:**
   - Go to Settings → Edge Functions → Environment Variables
   - Add `OPENAI_ARIA_KEY` with your actual OpenAI key

3. **Test with proper request:**
   ```json
   {
     "user_id": "123e4567-e89b-12d3-a456-426614174000"
   }
   ```

4. **Expected response:**
   ```json
   {
     "created": 2
   }
   ```

## 📋 **Deployment Checklist**

- ✅ Function updated with correct environment variables
- ⬜ `OPENAI_ARIA_KEY` set in Supabase Dashboard
- ⬜ Function deployed: `supabase functions deploy aria-generate-insights`
- ⬜ Test data created (see TEST-ARIA-INSIGHTS.md)
- ⬜ Function tested and working

## 🎉 **Next Steps**

Once environment variables are set correctly:
1. The function will work in **realtime** 
2. OpenAI API calls will succeed
3. Insights will be generated and stored
4. Ready for production use!

**The function is now properly configured - you just need to set the `OPENAI_ARIA_KEY` in your Supabase Dashboard!** 🚀