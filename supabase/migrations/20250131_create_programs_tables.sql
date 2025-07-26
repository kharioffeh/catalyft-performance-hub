-- Migration to create programs and program_blocks tables for aria-generate-program
-- This creates the new schema separate from the existing template/program_instance system

BEGIN;

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT NOT NULL,
    duration_weeks INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    ai_response TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create program_blocks table
CREATE TABLE IF NOT EXISTS public.program_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    day_offset INTEGER NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, day_offset)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS programs_created_by_idx ON public.programs(created_by);
CREATE INDEX IF NOT EXISTS programs_goal_idx ON public.programs(goal);
CREATE INDEX IF NOT EXISTS program_blocks_program_id_idx ON public.program_blocks(program_id);
CREATE INDEX IF NOT EXISTS program_blocks_day_offset_idx ON public.program_blocks(day_offset);

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for programs table
CREATE POLICY "Users can view own programs" ON public.programs
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own programs" ON public.programs
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own programs" ON public.programs
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own programs" ON public.programs
    FOR DELETE USING (created_by = auth.uid());

-- Create RLS policies for program_blocks table  
CREATE POLICY "Users can view own program blocks" ON public.program_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.programs 
            WHERE id = program_blocks.program_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert own program blocks" ON public.program_blocks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.programs 
            WHERE id = program_blocks.program_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update own program blocks" ON public.program_blocks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.programs 
            WHERE id = program_blocks.program_id 
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own program blocks" ON public.program_blocks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.programs 
            WHERE id = program_blocks.program_id 
            AND created_by = auth.uid()
        )
    );

-- Create RPC functions to create tables if they don't exist (for the edge function)
CREATE OR REPLACE FUNCTION public.create_programs_table_if_not_exists()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function is a no-op since the table is created in this migration
    -- It exists to satisfy the edge function call
    RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_program_blocks_table_if_not_exists()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function is a no-op since the table is created in this migration
    -- It exists to satisfy the edge function call
    RETURN;
END;
$$;

-- Add updated_at trigger for programs table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;