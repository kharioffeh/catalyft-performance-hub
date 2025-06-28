
-- Add RLS policies for the template table to allow proper CRUD operations
-- This will fix the template deletion issue by allowing owners to delete their templates

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view accessible templates" ON public.template;
DROP POLICY IF EXISTS "Users can create templates" ON public.template;
DROP POLICY IF EXISTS "Users can update own templates" ON public.template;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.template;

-- Enable RLS on template table (if not already enabled)
ALTER TABLE public.template ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own templates and public templates
CREATE POLICY "Users can view accessible templates" ON public.template
FOR SELECT TO authenticated
USING (
  owner_uuid = auth.uid() OR 
  visibility = 'public'
);

-- Policy to allow users to insert their own templates
CREATE POLICY "Users can create templates" ON public.template
FOR INSERT TO authenticated
WITH CHECK (owner_uuid = auth.uid());

-- Policy to allow users to update their own templates
CREATE POLICY "Users can update own templates" ON public.template
FOR UPDATE TO authenticated
USING (owner_uuid = auth.uid())
WITH CHECK (owner_uuid = auth.uid());

-- Policy to allow users to delete their own templates
CREATE POLICY "Users can delete own templates" ON public.template
FOR DELETE TO authenticated
USING (owner_uuid = auth.uid());
