-- =====================================================
-- Test Admin Fixes
-- Version: 1.0
-- Description: Verify admin profile loading and dashboard access
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT USER AND PROFILE
-- =====================================================

-- Check current user and profile
SELECT 
    auth.uid() as current_user_id,
    p.display_name,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ Admin user'
        ELSE '❌ Regular user'
    END as access_level
FROM public.profiles p
WHERE p.id = auth.uid();

-- =====================================================
-- 2. CHECK PROFILE LOADING ISSUE
-- =====================================================

-- Simulate the profile loading that happens in App.jsx
-- This should work without errors
SELECT 
    id,
    display_name,
    role,
    created_at
FROM public.profiles 
WHERE id = auth.uid();

-- =====================================================
-- 3. CHECK ADMIN DASHBOARD ACCESS
-- =====================================================

-- Check if admin can view all games (should work)
SELECT 
    COUNT(*) as total_games,
    COUNT(CASE WHEN is_complete THEN 1 END) as completed_games,
    COUNT(CASE WHEN NOT is_complete THEN 1 END) as active_games
FROM public.games;

-- =====================================================
-- 4. CHECK SPECIFIC GAME ACCESS
-- =====================================================

-- Check if admin can access a specific game
-- Replace 'GAME_ID_HERE' with an actual game ID
/*
SELECT 
    id,
    created_by,
    course_name,
    is_complete,
    created_at
FROM public.games 
WHERE id = 'GAME_ID_HERE';
*/

-- =====================================================
-- 5. VERIFY RLS POLICIES
-- =====================================================

-- Check RLS policies for games table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'games' 
ORDER BY policyname;

-- =====================================================
-- 6. TEST ADMIN FUNCTION
-- =====================================================

-- Test the is_admin() function
SELECT 
    'is_admin() function test' as test_description,
    public.is_admin() as is_admin_result;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
