-- =====================================================
-- Fix Finish Button RLS Policy
-- Version: 1.0
-- Description: Allow users to update is_complete from FALSE to TRUE
-- =====================================================

-- =====================================================
-- 1. DROP EXISTING UPDATE POLICIES
-- =====================================================

-- Drop existing update policies for games
DROP POLICY IF EXISTS "Users can update their own incomplete games" ON public.games;
DROP POLICY IF EXISTS "Admins can update any incomplete game" ON public.games;

-- =====================================================
-- 2. CREATE NEW UPDATE POLICIES
-- =====================================================

-- Policy for users to update their own games (complete or incomplete)
CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy for admins to update any game
CREATE POLICY "Admins can update any game"
  ON public.games FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 3. VERIFY POLICIES
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
WHERE tablename = 'games' 
ORDER BY policyname;

-- =====================================================
-- 4. TEST UPDATE PERMISSIONS
-- =====================================================

-- Test if current user can update their games
-- This should return the count of games the user can update
SELECT 
    'Can update own games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE created_by = auth.uid();

-- =====================================================
-- END OF SCRIPT
-- =====================================================
