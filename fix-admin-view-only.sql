-- =====================================================
-- Fix Admin View-Only Access
-- Version: 1.0
-- Description: Ensures admins can view all games but only update their own
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT POLICIES
-- =====================================================

-- Check current policies for games table
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
  AND tablename = 'games'
ORDER BY cmd, policyname;

-- =====================================================
-- 2. DROP EXISTING UPDATE POLICIES
-- =====================================================

-- Drop existing UPDATE policies to recreate them properly
DROP POLICY IF EXISTS "Users can update their own incomplete games" ON public.games;
DROP POLICY IF EXISTS "Admins can update any incomplete game" ON public.games;

-- =====================================================
-- 3. RECREATE UPDATE POLICIES WITH CORRECT LOGIC
-- =====================================================

-- Policy for ALL users (including admins): can only update their own incomplete games
CREATE POLICY "Users can update their own incomplete games"
  ON public.games FOR UPDATE
  USING (
    created_by = auth.uid()
    AND is_complete = FALSE
  )
  WITH CHECK (
    created_by = auth.uid()
    AND is_complete = FALSE
  );

-- =====================================================
-- 4. VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check that UPDATE policies exist
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
  AND tablename = 'games'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- =====================================================
-- 5. TEST POLICY LOGIC
-- =====================================================

-- Test what games admins can see vs update
SELECT 
    'Admin can see all games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE public.is_admin() = TRUE

UNION ALL

SELECT 
    'Admin can update own incomplete games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE is_complete = FALSE
  AND created_by = auth.uid()
  AND public.is_admin() = TRUE

UNION ALL

SELECT 
    'Regular user can see own games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE created_by = auth.uid()
  AND public.is_admin() = FALSE

UNION ALL

SELECT 
    'Regular user can update own incomplete games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE is_complete = FALSE
  AND created_by = auth.uid()
  AND public.is_admin() = FALSE;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
