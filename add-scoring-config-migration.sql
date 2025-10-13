-- Migration script to add scoring_config column to existing games table
-- Run this in Supabase SQL Editor if you have an existing database

-- Add scoring_config column to games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS scoring_config JSONB DEFAULT '{}'::jsonb;

-- Update existing games to have default scoring config
UPDATE public.games 
SET scoring_config = '{
  "eagleOrBetter": {"againstLower": 4},
  "birdie": {"againstLower": 2},
  "par": {"againstLower": 1},
  "bogey": {"againstLower": 1}
}'::jsonb
WHERE scoring_config IS NULL OR scoring_config = '{}'::jsonb;

-- Generate public_token for existing games that don't have one
UPDATE public.games 
SET public_token = uuid_generate_v4()
WHERE public_token IS NULL;

-- Verify the update
SELECT id, scoring_config, public_token FROM public.games LIMIT 5;
