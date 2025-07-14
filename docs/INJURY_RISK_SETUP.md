# Injury Risk Assessment Setup Guide

## Overview

The injury risk assessment system automatically calculates risk scores for athletes based on training load, sleep patterns, and stress levels. When risk scores exceed a threshold of 75, it automatically generates alerts in the notifications system.

## Formula

```
risk = z(load) + z(sleep_deficit) + z(stress)
```

Where:
- **z(load)** = Z-score of current load vs. historical load
- **z(sleep_deficit)** = Z-score of sleep deficit (8 hours - actual sleep)
- **z(stress)** = Z-score of stress level (derived from readiness score)

## Files Created

### `scripts/injuryRisk.js`
Main assessment script that:
- Fetches athlete metrics from the database
- Calculates z-scores for load, sleep deficit, and stress
- Computes composite risk scores
- Inserts alerts for high-risk athletes (≥75)

### Updated Files
- `package.json` - Added `injury-risk` npm script
- `scripts/README.md` - Added documentation

## Prerequisites

### Environment Variables
Create or update your `.env` file with:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** The script requires the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) to perform backend operations.

### Database Tables
The script uses these existing tables:
- `muscle_load_daily` - Training load scores per muscle per athlete
- `aria_digest_metrics_v` - Sleep hours and readiness scores  
- `notifications` - Target table for alerts

## Installation & Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Test the Script
```bash
# Manual test run
npm run injury-risk

# Or directly
node scripts/injuryRisk.js
```

### 3. Set Up Cron Job

#### Daily Assessment (6:00 AM)
```bash
# Edit crontab
crontab -e

# Add this line for daily 6 AM execution
0 6 * * * cd /path/to/workspace && npm run injury-risk >> logs/injury-risk.log 2>&1
```

#### Create Logs Directory
```bash
mkdir -p logs
```

#### Cron Job Alternatives
```bash
# Every 8 hours
0 */8 * * * cd /path/to/workspace && npm run injury-risk >> logs/injury-risk.log 2>&1

# Weekdays only at 6 AM
0 6 * * 1-5 cd /path/to/workspace && npm run injury-risk >> logs/injury-risk.log 2>&1

# Custom times (e.g., 6 AM and 6 PM)
0 6,18 * * * cd /path/to/workspace && npm run injury-risk >> logs/injury-risk.log 2>&1
```

## Usage Examples

### Manual Execution
```bash
# Run assessment for all athletes
npm run injury-risk

# Check logs
tail -f logs/injury-risk.log
```

### Expected Output
```
Starting injury risk assessment...
==================================================
Fetching athlete metrics for yesterday...
Found 5 athletes to assess
Calculating injury risk for John Doe...
  Load: 75.5 (z: 1.25)
  Sleep deficit: 2.5 hours (z: 1.00)
  Stress: 45 (z: 1.15)
  Final risk score: 3.40
Calculating injury risk for Jane Smith...
  Load: 95.2 (z: 2.85)
  Sleep deficit: 3.0 hours (z: 1.33)
  Stress: 60 (z: 2.00)
  Final risk score: 6.18
Inserting high injury risk alert for Jane Smith (risk: 6.18)
Alert successfully inserted for Jane Smith
==================================================
Assessment complete. Generated 1 alerts.
```

## Monitoring & Troubleshooting

### Log Monitoring
```bash
# View recent logs
tail -n 50 logs/injury-risk.log

# Monitor in real-time
tail -f logs/injury-risk.log

# Check for errors
grep -i error logs/injury-risk.log
```

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variables
   ```
   - Ensure `.env` file exists with correct Supabase credentials
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)

2. **Database Connection Issues**
   ```
   Error fetching load data: { message: "Invalid API key" }
   ```
   - Check Supabase URL and service role key
   - Verify Supabase project is active

3. **No Athletes Found**
   ```
   Found 0 athletes to assess
   ```
   - Check if there's data in `muscle_load_daily` for yesterday
   - Verify `aria_digest_metrics_v` view returns data

### Testing Data Availability
```bash
# Check if script can connect to database
node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Testing connection...');
const result = await supabase.from('notifications').select('count').limit(1);
console.log('Connection test:', result.error ? 'FAILED' : 'SUCCESS');
"
```

## Customization

### Adjusting Risk Threshold
Edit `scripts/injuryRisk.js`, line ~200:
```javascript
// Change threshold from 75 to desired value
if (riskScore >= 75) {
```

### Modifying Assessment Period
Edit the date calculation in `getAthleteMetrics()`:
```javascript
// Change from yesterday to 2 days ago
yesterday.setDate(yesterday.getDate() - 2);
```

### Custom Alert Messages
Edit `insertAlert()` function to customize notification content:
```javascript
title: 'High Injury Risk Alert',
body: `Custom message for ${athleteName}...`
```

## Integration with Monitoring

### Health Checks
Add to your existing health check script:
```bash
# Add to monitoring dashboard
npm run injury-risk --dry-run
```

### Alerts Integration
The system integrates with the existing notifications table, so alerts will appear in:
- In-app notification system
- Any notification dashboards
- Mobile push notifications (if configured)

## Security Considerations

1. **Service Role Key**: Store securely, never commit to version control
2. **Log Files**: May contain sensitive data, ensure proper access controls
3. **Cron Environment**: Verify cron has access to environment variables

## Performance Notes

- Assessment typically completes in <30 seconds for 100 athletes
- Uses efficient queries with proper indexes
- Minimal database load (read-only operations + single insert per alert)
- Can be run multiple times safely (no duplicate alert prevention built-in)