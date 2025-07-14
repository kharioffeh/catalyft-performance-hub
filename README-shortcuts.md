
# Keyboard Shortcuts

## Command Palette
- **⌘K** (Mac) / **Ctrl+K** (Windows) - Open command palette
- **ESC** - Close command palette
- **↑/↓** - Navigate results
- **Enter** - Execute selected command

## Quick Navigation (via Command Palette)
- **d** - Dashboard
- **c** - Chat with ARIA
- **s** - Settings
- **p** - Program (Solo users)
- **t** - Training Plan/Programs
- **a** - Athletes (Coaches)
- **r** - Risk Board (Coaches)
- **n** - Analytics
- **l** - Calendar

## Quick Actions (via Command Palette)
- **⌘⇧T** - Toggle dark/light mode
- **⌘I** - Invite athlete (Coaches)
- **⌘⇧Q** - Sign out

## Usage
1. Press **⌘K** anywhere in the app
2. Start typing to search for:
   - Navigation pages
   - Athletes (coaches only)
   - Templates
   - Quick actions
3. Use arrow keys to navigate results
4. Press **Enter** to execute

## API Examples

### Upsert User Metrics
```bash
curl -X POST https://your-project.supabase.co/functions/v1/upsertMetrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "hrv_rmssd": 45.2,
    "hr_rest": 60,
    "steps": 8500,
    "sleep_min": 420,
    "strain": 7.1,
    "date": "2025-07-14"
  }'
```

Response:
```json
{
  "status": "ok"
}
```

### Pull Whoop Recovery Data
```bash
curl -X POST https://your-project.supabase.co/functions/v1/pull-whoop-recovery \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:
```json
{
  "message": "Processed 5 athletes for 2025-01-14",
  "pulled": 4,
  "errors": 1,
  "date": "2025-01-14"
}
```

**Scheduled**: Runs automatically daily at 06:00 UTC via cron job.
