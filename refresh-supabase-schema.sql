-- =====================================================
-- Refresh Supabase Schema Cache
-- Version: 1.0
-- Description: Forces Supabase to refresh its schema cache
-- =====================================================

-- =====================================================
-- 1. NOTIFY SUPABASE TO REFRESH SCHEMA CACHE
-- =====================================================

-- This notifies Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 2. ALTERNATIVE: TRIGGER SCHEMA REFRESH BY ALTERING TABLES
-- =====================================================

-- Sometimes altering a table (even with no-op changes) forces schema refresh
ALTER TABLE public.games SET (fillfactor = 100);
ALTER TABLE public.courses SET (fillfactor = 100);
ALTER TABLE public.profiles SET (fillfactor = 100);

-- =====================================================
-- 3. VERIFY FOREIGN KEY CONSTRAINTS EXIST
-- =====================================================

-- Check that our foreign key constraints are properly defined
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.contype = 'f'
  AND c.conrelid::regclass::text IN ('public.games', 'public.courses')
  AND c.confrelid::regclass::text = 'public.profiles'
ORDER BY table_name, constraint_name;

-- =====================================================
-- 4. CHECK SUPABASE SYSTEM TABLES
-- =====================================================

-- Check if Supabase has recorded our foreign key relationships
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND tablename IN ('games', 'courses', 'profiles')
  AND attname IN ('id', 'created_by')
ORDER BY tablename, attname;

-- =====================================================
-- 5. FORCE SCHEMA CACHE INVALIDATION
-- =====================================================

-- Force PostgreSQL to re-analyze the tables
ANALYZE public.games;
ANALYZE public.courses;
ANALYZE public.profiles;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
