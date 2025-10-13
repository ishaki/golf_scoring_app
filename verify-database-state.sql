-- =====================================================
-- Verify Database State
-- Version: 1.0
-- Description: Comprehensive verification of database state and relationships
-- =====================================================

-- =====================================================
-- 1. CHECK IF TABLES EXIST
-- =====================================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'courses', 'games')
ORDER BY table_name;

-- =====================================================
-- 2. CHECK TABLE COLUMNS
-- =====================================================

-- Profiles table columns
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Courses table columns
SELECT 
    'courses' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Games table columns
SELECT 
    'games' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'games' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK ALL FOREIGN KEY CONSTRAINTS
-- =====================================================

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
-- 4. CHECK SPECIFIC FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Check games -> profiles relationship
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column,
    confdeltype as delete_action
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.contype = 'f'
  AND c.conrelid::regclass::text = 'public.games'
  AND c.confrelid::regclass::text = 'public.profiles';

-- Check courses -> profiles relationship
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name,
    af.attname as referenced_column,
    confdeltype as delete_action
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
WHERE c.contype = 'f'
  AND c.conrelid::regclass::text = 'public.courses'
  AND c.confrelid::regclass::text = 'public.profiles';

-- =====================================================
-- 5. TEST DATA INTEGRITY
-- =====================================================

-- Check if there are any orphaned records
SELECT 
    'games without matching profiles' as issue,
    COUNT(*) as count
FROM public.games g
LEFT JOIN public.profiles p ON g.created_by = p.id
WHERE p.id IS NULL;

SELECT 
    'courses without matching profiles' as issue,
    COUNT(*) as count
FROM public.courses c
LEFT JOIN public.profiles p ON c.created_by = p.id
WHERE p.id IS NULL;

-- =====================================================
-- 6. CHECK ROW LEVEL SECURITY
-- =====================================================

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'courses', 'games')
ORDER BY tablename;

-- =====================================================
-- 7. CHECK POLICIES
-- =====================================================

-- Check policies for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'courses', 'games')
ORDER BY tablename, policyname;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
