
-- Phase 1: Database Schema Update for Multi-Tier Plans System

-- 1. Create the plans table with all tiers and features
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT CHECK (type IN ('coach', 'solo', 'topup')) NOT NULL,
  price_id TEXT NOT NULL,
  max_athletes INTEGER,
  has_aria_full BOOLEAN DEFAULT false,
  has_adaptive_replan BOOLEAN DEFAULT false,
  long_term_analytics BOOLEAN DEFAULT false,
  export_api BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add plan_id column to billing_customers table
ALTER TABLE public.billing_customers 
ADD COLUMN plan_id TEXT REFERENCES public.plans(id);

-- 3. Seed the plans table with the 4 main tiers plus athlete top-up
INSERT INTO public.plans (id, label, type, price_id, max_athletes, has_aria_full, has_adaptive_replan, long_term_analytics, export_api, priority_support)
VALUES
('coach_basic', 'Coach', 'coach', 'price_1QWExample1', 10, true, false, false, false, false),
('coach_pro', 'Coach Pro', 'coach', 'price_1QWExample2', 50, true, true, true, true, true),
('solo_basic', 'Solo', 'solo', 'price_1QWExample3', null, true, false, false, false, false),
('solo_pro', 'Solo Pro', 'solo', 'price_1QWExample4', null, true, true, true, true, true),
('athlete_topup', 'Athlete Top-Up', 'topup', 'price_1QWExample5', null, false, false, false, false, false);

-- 4. Update existing billing_customers to have default plans based on their role
UPDATE public.billing_customers 
SET plan_id = CASE 
  WHEN role = 'coach' THEN 'coach_basic'
  WHEN role = 'solo' THEN 'solo_basic'
  ELSE 'solo_basic'
END
WHERE plan_id IS NULL;

-- 5. Update the billing trigger function to set default plan_id
CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert billing record with 30-day trial and default plan
  INSERT INTO public.billing_customers (id, role, plan_id, trial_end, plan_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'solo'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'solo') = 'coach' THEN 'coach_basic'
      ELSE 'solo_basic'
    END,
    NOW() + INTERVAL '30 days',
    'trialing'
  );
  
  RETURN NEW;
END;
$$;

-- 6. Enable Row Level Security on plans table (read-only for all authenticated users)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans" 
ON public.plans 
FOR SELECT 
USING (true);
