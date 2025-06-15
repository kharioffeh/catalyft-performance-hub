
-- Migration: 20240615_remove_legacy_kai.sql
-- Remove legacy KAI and ARIA views after 1 release cycle
-- All insights are now unified in the ai_insights table

-- Drop the backward compatibility views
DROP VIEW IF EXISTS public.kai_insights_v;
DROP VIEW IF EXISTS public.aria_insights_v;

-- Clean up any policies that were specific to these views
-- (Note: The main ai_insights table policies remain intact)

-- Add a comment for historical context
COMMENT ON TABLE public.ai_insights IS 'Unified table for all AI insights (formerly separate KAI and ARIA systems). Legacy views kai_insights_v and aria_insights_v removed 2024-06-15.';
