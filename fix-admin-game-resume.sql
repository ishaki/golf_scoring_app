-- =====================================================
-- Fix Admin Game Resume Issue
-- Version: 1.0
-- Description: Ensures admins can resume any game, not just their own
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT POLICIES
-- =====================================================

-- Check current UPDATE policies for games table
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
-- 2. DROP EXISTING UPDATE POLICIES
-- =====================================================

-- Drop existing UPDATE policies to recreate them properly
DROP POLICY IF EXISTS "Users can update their own incomplete games" ON public.games;
DROP POLICY IF EXISTS "Admins can update any incomplete game" ON public.games;

-- =====================================================
-- 3. RECREATE UPDATE POLICIES WITH PROPER LOGIC
-- =====================================================

-- Policy for regular users: can only update their own incomplete games
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

-- Policy for admins: can update ANY incomplete game (regardless of creator)
CREATE POLICY "Admins can update any incomplete game"
  ON public.games FOR UPDATE
  USING (
    is_complete = FALSE
    AND public.is_admin()
  )
  WITH CHECK (
    is_complete = FALSE
    AND public.is_admin()
  );

-- =====================================================
-- 4. VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check that both UPDATE policies exist
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
-- 5. TEST ADMIN FUNCTION
-- =====================================================

-- Test if is_admin() function works correctly
-- This should return true for admin users, false for regular users
SELECT 
    auth.uid() as current_user_id,
    public.is_admin() as is_admin_check;

-- =====================================================
-- 6. CHECK USER ROLES
-- =====================================================

-- Check current user roles (this will show the role of the currently authenticated user)
SELECT 
    id,
    display_name,
    role,
    created_at
FROM public.profiles 
WHERE id = auth.uid();

-- =====================================================
-- 7. VERIFY GAME ACCESS LOGIC
-- =====================================================

-- Test query that mimics what loadCurrentGame does
-- This should show what games an admin can see vs regular users
SELECT 
    'Admin can see all incomplete games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE is_complete = FALSE
  AND public.is_admin() = TRUE

UNION ALL

SELECT 
    'Regular user can see own incomplete games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE is_complete = FALSE
  AND created_by = auth.uid()
  AND public.is_admin() = FALSE;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
