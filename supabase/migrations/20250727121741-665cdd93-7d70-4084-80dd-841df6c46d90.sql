-- Create session_finishers table
CREATE TABLE public.session_finishers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  protocol_id UUID NOT NULL,
  auto_assigned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_finishers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own session finishers" 
ON public.session_finishers 
FOR SELECT 
USING (auth.uid() IN (
  SELECT athlete_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
  UNION
  SELECT coach_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
));

CREATE POLICY "Users can create their own session finishers" 
ON public.session_finishers 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT athlete_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
  UNION
  SELECT coach_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
));

CREATE POLICY "Users can update their own session finishers" 
ON public.session_finishers 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT athlete_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
  UNION
  SELECT coach_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
));

CREATE POLICY "Users can delete their own session finishers" 
ON public.session_finishers 
FOR DELETE 
USING (auth.uid() IN (
  SELECT athlete_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
  UNION
  SELECT coach_uuid FROM sessions WHERE sessions.id = session_finishers.session_id
));

-- Create mobility_protocols table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mobility_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  muscle_targets TEXT[] DEFAULT '{}',
  instructions TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on mobility_protocols
ALTER TABLE public.mobility_protocols ENABLE ROW LEVEL SECURITY;

-- Create policies for mobility protocols (public read access)
CREATE POLICY "Anyone can view mobility protocols" 
ON public.mobility_protocols 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates on session_finishers
CREATE TRIGGER update_session_finishers_updated_at
BEFORE UPDATE ON public.session_finishers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on mobility_protocols
CREATE TRIGGER update_mobility_protocols_updated_at
BEFORE UPDATE ON public.mobility_protocols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample mobility protocols
INSERT INTO public.mobility_protocols (name, description, duration_min, muscle_targets, instructions) VALUES
  ('Hip Flexor Stretch', 'Dynamic hip flexor stretch to improve hip mobility and reduce tightness', 5, '{"hip_flexors", "glutes"}', 'Perform 3 sets of 30-second holds on each side'),
  ('Hamstring Release', 'Target hamstring tightness with controlled stretching movements', 8, '{"hamstrings", "calves"}', 'Use foam roller followed by static stretches'),
  ('Shoulder Mobility', 'Comprehensive shoulder mobility routine for overhead athletes', 10, '{"shoulders", "upper_back"}', 'Include arm circles, wall slides, and cross-body stretches'),
  ('Thoracic Spine Mobility', 'Improve thoracic spine extension and rotation', 7, '{"upper_back", "core"}', 'Perform cat-cow and thoracic extensions with foam roller'),
  ('Ankle Mobility', 'Address ankle stiffness and improve dorsiflexion range', 6, '{"calves", "ankles"}', 'Calf stretches and ankle circles in multiple planes');