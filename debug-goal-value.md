# Quick Debug: Find the Goal Value Being Sent

## 🔍 To see what goal value is causing the constraint violation:

### Option 1: Check Network Tab
1. **F12** → **Network tab**
2. **Try Generate with AI again**
3. **Click on `aria-generate-program` request**
4. **Go to Payload tab**
5. **Look for the `goal` value being sent**
6. **Tell me what goal value you see**

### Option 2: Check Browser Console
Add this temporary console log:
1. **F12** → **Console tab**
2. **Before clicking Generate**, paste this:
```javascript
// Intercept the fetch to see what's being sent
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('aria-generate-program')) {
    console.log('ARIA Generate Request:', args[1]?.body);
  }
  return originalFetch.apply(this, args);
};
```
3. **Try Generate with AI**
4. **Look for the logged request body**

## 🛠️ Solutions Based on Findings:

### If you can apply the migration:
The migration I created will allow all possible goal values.

### If you can't apply the migration:
I'll modify the edge function to map any goal value to a valid one.

## 🎯 Most Likely Issue:
The current form is probably sending one of these invalid values:
- `"muscle"` (should be `"hypertrophy"`)
- `"max_strength"` (should be `"strength"`)
- `"rehabilitation"` (should be `"rehab"`)

**Please check the Network tab Payload to see the exact goal value being sent!**