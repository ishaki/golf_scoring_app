-- =====================================================
-- Fix Supabase Relationships
-- Version: 1.0
-- Description: Ensures proper foreign key relationships for Supabase schema cache
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Check all foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- 2. DROP AND RECREATE FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_created_by_fkey;
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_created_by_fkey;

-- Recreate foreign key constraints with explicit naming
ALTER TABLE public.games
ADD CONSTRAINT games_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.courses
ADD CONSTRAINT courses_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =====================================================
-- 3. VERIFY CONSTRAINTS WERE CREATED
-- =====================================================

-- Verify games foreign key
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
  AND tc.constraint_name = 'games_created_by_fkey';

-- Verify courses foreign key
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
  AND tc.constraint_name = 'courses_created_by_fkey';

-- =====================================================
-- 4. CHECK TABLE STRUCTURE
-- =====================================================

-- Check games table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'games' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 5. TEST RELATIONSHIP WITH SAMPLE QUERY
-- =====================================================

-- Test if the relationship works with a simple join
SELECT 
    g.id as game_id,
    g.created_by,
    p.id as profile_id,
    p.display_name,
    p.role
FROM public.games g
LEFT JOIN public.profiles p ON g.created_by = p.id
LIMIT 5;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
