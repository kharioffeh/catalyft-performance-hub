
-- Phase 1: Database Schema Updates

-- 1. Create currencies table with popular world currencies
CREATE TABLE public.currencies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  exchange_rate_to_gbp NUMERIC(10,6) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert popular world currencies with exchange rates (base: GBP)
INSERT INTO public.currencies (id, name, symbol, exchange_rate_to_gbp) VALUES
('GBP', 'British Pound', '£', 1.0),
('USD', 'US Dollar', '$', 0.79),
('EUR', 'Euro', '€', 0.85),
('CAD', 'Canadian Dollar', 'C$', 0.58),
('AUD', 'Australian Dollar', 'A$', 0.52),
('JPY', 'Japanese Yen', '¥', 0.0055),
('CHF', 'Swiss Franc', 'Fr', 0.88),
('SEK', 'Swedish Krona', 'kr', 0.075),
('NOK', 'Norwegian Krone', 'kr', 0.072),
('DKK', 'Danish Krone', 'kr', 0.11),
('SGD', 'Singapore Dollar', 'S$', 0.58),
('HKD', 'Hong Kong Dollar', 'HK$', 0.10),
('NZD', 'New Zealand Dollar', 'NZ$', 0.48),
('ZAR', 'South African Rand', 'R', 0.044),
('BRL', 'Brazilian Real', 'R$', 0.13);

-- 2. Create user currency preferences table
CREATE TABLE public.user_currency_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code TEXT REFERENCES public.currencies(id) NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Enhance billing_customers table with athlete management and currency support
ALTER TABLE public.billing_customers 
ADD COLUMN IF NOT EXISTS current_athlete_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_athletes_purchased INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_addon_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS preferred_currency TEXT REFERENCES public.currencies(id) DEFAULT 'GBP';

-- 4. Create athlete purchases history table
CREATE TABLE public.athlete_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_customer_id UUID REFERENCES public.billing_customers(id) ON DELETE CASCADE,
  athlete_pack_size INTEGER NOT NULL DEFAULT 10,
  monthly_cost_added NUMERIC(10,2) NOT NULL,
  currency_code TEXT REFERENCES public.currencies(id) NOT NULL,
  stripe_subscription_item_id TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Update plans table with GBP pricing and enhanced features
UPDATE public.plans SET
  label = 'Solo Basic',
  type = 'solo',
  max_athletes = NULL,
  has_aria_full = true,
  has_adaptive_replan = false,
  long_term_analytics = false,
  export_api = false,
  priority_support = false
WHERE id = 'solo_basic';

UPDATE public.plans SET
  label = 'Solo Pro',
  type = 'solo', 
  max_athletes = NULL,
  has_aria_full = true,
  has_adaptive_replan = true,
  long_term_analytics = true,
  export_api = true,
  priority_support = true
WHERE id = 'solo_pro';

UPDATE public.plans SET
  label = 'Coach Basic',
  type = 'coach',
  max_athletes = 10,
  has_aria_full = true,
  has_adaptive_replan = false,
  long_term_analytics = false,
  export_api = false,
  priority_support = false
WHERE id = 'coach_basic';

UPDATE public.plans SET
  label = 'Coach Pro',
  type = 'coach',
  max_athletes = 50,
  has_aria_full = true,
  has_adaptive_replan = true,
  long_term_analytics = true,
  export_api = true,
  priority_support = true
WHERE id = 'coach_pro';

-- Re-add athlete top-up plan
INSERT INTO public.plans (id, label, type, price_id, max_athletes, has_aria_full, has_adaptive_replan, long_term_analytics, export_api, priority_support)
VALUES ('athlete_topup', 'Athlete Top-Up (10 Athletes)', 'topup', 'price_1QWAthleteTopUp', NULL, false, false, false, false, false)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  type = EXCLUDED.type,
  price_id = EXCLUDED.price_id;

-- 6. Enable Row Level Security on new tables
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_currency_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for currencies (public read)
CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT USING (true);

-- Create RLS policies for user currency preferences
CREATE POLICY "Users can view their own currency preferences" ON public.user_currency_preferences
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own currency preferences" ON public.user_currency_preferences
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own currency preferences" ON public.user_currency_preferences
FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for athlete purchases
CREATE POLICY "Users can view their own athlete purchases" ON public.athlete_purchases
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Edge functions can insert athlete purchases" ON public.athlete_purchases
FOR INSERT WITH CHECK (true);

CREATE POLICY "Edge functions can update athlete purchases" ON public.athlete_purchases
FOR UPDATE USING (true);

-- 7. Create functions for currency conversion
CREATE OR REPLACE FUNCTION public.convert_price(
  base_price NUMERIC,
  from_currency TEXT DEFAULT 'GBP',
  to_currency TEXT DEFAULT 'GBP'
) RETURNS NUMERIC AS $$
DECLARE
  from_rate NUMERIC;
  to_rate NUMERIC;
  converted_price NUMERIC;
BEGIN
  -- Get exchange rates
  SELECT exchange_rate_to_gbp INTO from_rate FROM public.currencies WHERE id = from_currency;
  SELECT exchange_rate_to_gbp INTO to_rate FROM public.currencies WHERE id = to_currency;
  
  -- Convert: price in GBP / target_rate
  converted_price = (base_price * from_rate) / to_rate;
  
  RETURN ROUND(converted_price, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Create function to check athlete limits
CREATE OR REPLACE FUNCTION public.can_add_athlete_enhanced(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  billing_record RECORD;
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get billing information
  SELECT 
    bc.*,
    p.max_athletes,
    p.type as plan_type
  INTO billing_record
  FROM public.billing_customers bc
  JOIN public.plans p ON bc.plan_id = p.id
  WHERE bc.id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Solo plans have unlimited athletes
  IF billing_record.plan_type = 'solo' THEN
    RETURN true;
  END IF;
  
  -- Calculate total allowed athletes (base + purchased)
  max_allowed = billing_record.max_athletes + billing_record.additional_athletes_purchased;
  
  -- Get current athlete count
  SELECT COUNT(*) INTO current_count
  FROM public.athletes a
  WHERE a.coach_uuid IN (
    SELECT c.id FROM public.coaches c 
    JOIN public.profiles p ON c.email = p.email 
    WHERE p.id = user_uuid
  );
  
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. Update existing billing trigger to include athlete count tracking
CREATE OR REPLACE FUNCTION public.update_athlete_count_on_billing()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current athlete count when athletes are added/removed
  UPDATE public.billing_customers 
  SET current_athlete_count = (
    SELECT COUNT(*)
    FROM public.athletes a
    JOIN public.coaches c ON a.coach_uuid = c.id
    JOIN public.profiles p ON c.email = p.email
    WHERE p.id = billing_customers.id
  )
  WHERE id = COALESCE(NEW.coach_uuid, OLD.coach_uuid);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for athlete count tracking
DROP TRIGGER IF EXISTS update_athlete_count_trigger ON public.athletes;
CREATE TRIGGER update_athlete_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_athlete_count_on_billing();
