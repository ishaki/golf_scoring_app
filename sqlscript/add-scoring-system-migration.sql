-- Add scoring_system column to games table
-- This migration adds support for multiple scoring systems

-- Add scoring_system column
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS scoring_system TEXT DEFAULT 'fighter' CHECK (scoring_system IN ('fighter', 'single_winner'));

-- Update existing games to use fighter scoring system (default)
UPDATE public.games 
SET scoring_system = 'fighter'
WHERE scoring_system IS NULL;

-- Verify the update
SELECT id, scoring_system, scoring_config FROM public.games LIMIT 5;
