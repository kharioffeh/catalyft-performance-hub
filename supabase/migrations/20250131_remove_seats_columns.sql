-- Remove seat-related columns for solo-only billing pivot
-- cur-pivot-05: Simplify billing to single-user Pro tier only

-- 1. Drop the athlete_purchases table entirely (no more seat management)
DROP TABLE IF EXISTS public.athlete_purchases CASCADE;

-- 2. Remove seat/athlete-related columns from billing_customers
ALTER TABLE public.billing_customers 
  DROP COLUMN IF EXISTS current_athlete_count,
  DROP COLUMN IF EXISTS additional_athletes_purchased,
  DROP COLUMN IF EXISTS monthly_addon_cost;

-- 3. Remove plan_id column since we're using fixed solo pro pricing
ALTER TABLE public.billing_customers 
  DROP COLUMN IF EXISTS plan_id;

-- 4. Add current_period_end column for subscription management
ALTER TABLE public.billing_customers 
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- 5. Update RLS policies to remove any seat-based filtering
-- This is a safety measure in case any policies reference the dropped columns

-- 6. Remove currency-related columns since we're simplifying to fixed pricing
ALTER TABLE public.billing_customers 
  DROP COLUMN IF EXISTS preferred_currency;

-- 7. Drop the user_currency_preferences table if it exists
DROP TABLE IF EXISTS public.user_currency_preferences CASCADE;

-- 8. Drop the plans table since we're using environment variables for pricing
DROP TABLE IF EXISTS public.plans CASCADE;

-- 9. Drop currency-related tables
DROP TABLE IF EXISTS public.currencies CASCADE;