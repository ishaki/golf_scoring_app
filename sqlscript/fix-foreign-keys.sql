-- =====================================================
-- Fix Foreign Key Relationships
-- Version: 1.0
-- Description: Adds missing foreign key relationships between tables
-- =====================================================

-- =====================================================
-- 1. ADD FOREIGN KEY FROM GAMES TO PROFILES
-- =====================================================

-- Add foreign key constraint from games.created_by to profiles.id
-- This allows Supabase to understand the relationship for joins and RLS
-- Use IF NOT EXISTS equivalent by checking if constraint exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'games_created_by_fkey' 
        AND table_name = 'games' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.games
        ADD CONSTRAINT games_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 2. ADD FOREIGN KEY FROM COURSES TO PROFILES
-- =====================================================

-- Add foreign key constraint from courses.created_by to profiles.id
-- This allows Supabase to understand the relationship for joins and RLS
-- Use IF NOT EXISTS equivalent by checking if constraint exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courses_created_by_fkey' 
        AND table_name = 'courses' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.courses
        ADD CONSTRAINT courses_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 3. VERIFY FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Check foreign key constraints for games table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'games'
ORDER BY tc.constraint_name;

-- Check foreign key constraints for courses table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'courses'
ORDER BY tc.constraint_name;

-- Check foreign key constraints for profiles table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'profiles'
ORDER BY tc.constraint_name;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
