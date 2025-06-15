
# Migrating KAI Insights Into ARIA (Unified Insights)

## Overview

This document summarizes the migration to unify "KAI" (chat/program insights) and "ARIA" (readiness/workout insights) under the new `ai_insights` system and updated codebase.

**Key changes:**
- All insights (readiness, workout, chat, etc.) are now stored in the single `ai_insights` table.
- Both KAI (program/chat) and ARIA (readiness) events use the same unified API and schema.
- Application code is updated to reference `ai_insights` and new views where necessary.
- New API route for programmatic access: [`/rest/v1/ai_insights`](../rest/v1/ai_insights).

---

## Manual Steps Remaining

✅ **[COMPLETED 2024-06-15]** The following clean-up steps have been completed:

1. ✅ **Deleted old legacy views:**
   - `kai_insights_v`
   - `aria_insights_v`

2. ✅ **Removed deprecated environment variables:**
   - All KAI-specific variables removed from codebase

3. ✅ **Retired KAI-specific functionality:**
   - Updated all components to use unified `ai_insights` table
   - Removed legacy view dependencies
   - Updated navigation to remove KAI-specific routes

---

## New API Access

- The unified endpoint for all AI insights (KAI & ARIA) is:

  ```
  /rest/v1/ai_insights
  ```

  See your Supabase docs or swagger reference for request/response formats.

---

## Questions & Support

For more information or assistance, please consult the [Supabase dashboard](https://supabase.com/dashboard/project/xeugyryfvilanoiethum) or your engineering lead.
