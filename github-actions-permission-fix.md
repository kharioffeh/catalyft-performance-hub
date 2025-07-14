# GitHub Actions Permission Fix Guide

## Issue Description
The error `Resource not accessible by integration` with HTTP 403 status occurs when a GitHub Action tries to create a comment on issue #2 but lacks the necessary permissions.

## Root Cause Analysis
The error shows:
- Action: `actions/github-script@v7`
- Attempting to: POST to `/repos/kharioffeh/catalyft-performance-hub/issues/2/comments`
- Required permissions: `issues=write; pull_requests=write`
- Error: `Resource not accessible by integration`

## Solutions

### Solution 1: Add Permissions to GitHub Workflow

If you have a GitHub workflow using `actions/github-script@v7`, add the necessary permissions:

```yaml
name: Your Workflow Name
on:
  # your triggers

jobs:
  your-job:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      contents: read
    
    steps:
      - name: Your step using github-script
        uses: actions/github-script@v7
        with:
          script: |
            // your script here
```

### Solution 2: Update Repository Settings

1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions", ensure:
   - Either "Read and write permissions" is selected
   - Or "Read repository contents and packages permissions" with specific permissions granted

### Solution 3: Fix the Health Check Workflow

Based on your current `health-check.yml`, if you want to add comment functionality when health checks fail, update it like this:

```yaml
name: Environment Health Check

on:
  pull_request:
    types: [opened, reopened, synchronize]
  workflow_dispatch: {}

permissions:
  issues: write
  pull-requests: write
  contents: read

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Node 20 and install
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci --legacy-peer-deps
      
    - name: Run health check
      id: health-check
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        OPENAI_KAI_KEY: ${{ secrets.OPENAI_KAI_KEY }}
        OPENAI_ARIA_KEY: ${{ secrets.OPENAI_ARIA_KEY }}
        ABLY_API_KEY: ${{ secrets.ABLY_API_KEY }}
      run: node scripts/health-check.js
      continue-on-error: true
      
    - name: Comment on failure
      if: failure() && github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '🚨 Health check failed! Please check the logs for more details.'
          })
      
    - name: Build project
      if: success()
      run: npm run build
      
    - name: Deploy edge functions (smoke test)
      if: success()
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      run: |
        npm install -g supabase --legacy-peer-deps
        supabase functions deploy --verify-jwt=false --project-ref=xeugyryfvilanoiethum
      continue-on-error: true
```

### Solution 4: Check for External Integrations

If the error persists and you don't have `actions/github-script@v7` in your workflows:

1. Check repository settings for installed GitHub Apps
2. Look for external CI/CD integrations that might be trying to post comments
3. Review any third-party services connected to your repository

### Solution 5: Token Permissions (if using custom token)

If you're using a custom `GITHUB_TOKEN` or personal access token:

1. Ensure the token has `repo` scope or at minimum:
   - `public_repo` (for public repositories)
   - `issues:write`
   - `pull_requests:write`

## Immediate Fix

The quickest fix is to add permissions to your workflow file. Update `.github/workflows/health-check.yml`:

```yaml
permissions:
  issues: write
  pull-requests: write
  contents: read
```

Add this right after the `on:` section and before `jobs:`.

## Verification

After implementing the fix:
1. Trigger the workflow again
2. Check that comments can be created successfully
3. Monitor the Actions logs for any remaining permission issues

## Prevention

To prevent this issue in the future:
- Always specify explicit permissions in workflows that interact with GitHub API
- Use the principle of least privilege - only grant necessary permissions
- Test permission changes in a development environment first