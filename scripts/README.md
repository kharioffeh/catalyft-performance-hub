
# Scripts

This directory contains utility scripts for the application.

## Available Scripts

### health-check.js
Performs comprehensive health checks on various system components:
- Environment variables
- Supabase connectivity  
- Edge functions
- Realtime connectivity

Usage: `node scripts/health-check.js`

### injuryRisk.js
Automated injury risk assessment script that calculates risk scores based on:
- Training load (z-score)
- Sleep deficit (z-score) 
- Stress levels (z-score derived from readiness)

**Formula:** `risk = z(load) + z(sleep_deficit) + z(stress)`

When risk score ≥ 75, automatically inserts alerts into the notifications table.

**Usage:**
```bash
# Run manually
node scripts/injuryRisk.js

# Run via npm script
npm run injury-risk

# Set up daily cron job (runs at 6:00 AM every day)
crontab -e
# Add this line:
0 6 * * * cd /path/to/workspace && node scripts/injuryRisk.js >> logs/injury-risk.log 2>&1
```

**Environment Variables Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend operations

**Data Sources:**
- `muscle_load_daily` - Training load scores per muscle per athlete
- `aria_digest_metrics_v` - Sleep hours and readiness scores
- `notifications` - Target table for alerts

### Other Scripts
- `bundle-check.js` - Bundle size analysis
- `test-invite.js` - Tests invitation functionality  
- `validate-contrast.js` - WCAG contrast validation

## Setup

1. Ensure all environment variables are properly configured
2. Install dependencies: `npm install`
3. Make scripts executable: `chmod +x scripts/*.js`
4. Test individual scripts before setting up automation
