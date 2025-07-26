-- Add is_streamed column to aria_messages table
-- This tracks whether messages were sent via streaming API

ALTER TABLE public.aria_messages 
ADD COLUMN is_streamed boolean DEFAULT true;