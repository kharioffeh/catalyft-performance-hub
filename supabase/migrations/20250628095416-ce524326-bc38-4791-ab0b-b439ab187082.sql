
-- Create billing_customers table for 30-day free trial system
CREATE TABLE public.billing_customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('coach', 'solo')),
  trial_end TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_status TEXT NOT NULL DEFAULT 'trialing' CHECK (plan_status IN ('trialing', 'active', 'past_due', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own billing info
CREATE POLICY "Users can view and update their own billing info" 
ON public.billing_customers 
FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user billing setup
CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert billing record with 30-day trial
  INSERT INTO public.billing_customers (id, role, trial_end, plan_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'solo'),
    NOW() + INTERVAL '30 days',
    'trialing'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set up billing for new users
CREATE TRIGGER on_auth_user_created_billing
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_billing();
