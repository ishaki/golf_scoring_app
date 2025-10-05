-- Cleanup Script for Bad Game IDs
-- Run this in Supabase SQL Editor if you have games with invalid UUIDs

-- 1. Check for games with invalid UUID format
-- (This query will fail if there are any, which is expected)
SELECT id, course_name, created_at
FROM games
WHERE id::text NOT LIKE '%-%-%-%-%';

-- 2. If the above fails, delete ALL games (use with caution!)
-- Uncomment the line below to delete all games and start fresh:
-- DELETE FROM games WHERE created_by = auth.uid();

-- 3. Or delete ALL games in the database (DANGER! Only use for testing)
-- Uncomment to delete everything:
-- DELETE FROM games;

-- 4. After cleanup, you can verify:
SELECT COUNT(*) as total_games FROM games;
SELECT COUNT(*) as my_games FROM games WHERE created_by = auth.uid();
