
# Test Scripts

## Invite Function Test

This script tests the invite-athlete edge function directly.

### Usage

1. **Get a valid coach access token:**
   - Login as a coach in your browser
   - Open Developer Tools → Network tab
   - Make any authenticated request
   - Copy the Bearer token from the Authorization header

2. **Update the script:**
   - Open `scripts/test-invite.js`
   - Replace `<PASTE_A_VALID_COACH_ACCESS_TOKEN_HERE>` with your actual token

3. **Run the test:**

   For local testing:
   ```bash
   node scripts/test-invite.js
   ```

   For production testing:
   ```bash
   INVITE_URL=https://YOUR_PROJECT_REF.functions.supabase.co/invite-athlete node scripts/test-invite.js
   ```

### Expected Output

- You should see the request details logged
- Status should be 200 for success
- Response body should contain success message or error details
- Check your Supabase Edge Function logs for the console.log statements added to the function

### Troubleshooting

- Make sure your access token is valid and from a coach account
- Verify the function URL is correct
- Check Supabase logs for detailed error messages
