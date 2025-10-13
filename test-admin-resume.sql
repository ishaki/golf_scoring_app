-- =====================================================
-- Test Admin Resume Functionality
-- Version: 1.0
-- Description: Verify that admins can only resume their own games
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT USER AND ROLE
-- =====================================================

-- Check current user and their role
SELECT 
    auth.uid() as current_user_id,
    p.display_name,
    p.role,
    public.is_admin() as is_admin_check
FROM public.profiles p
WHERE p.id = auth.uid();

-- =====================================================
-- 2. CHECK GAMES VISIBLE TO CURRENT USER
-- =====================================================

-- Check what games the current user can see (should be all for admin, own for regular user)
SELECT 
    'All games visible to current user' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE public.is_admin() = TRUE

UNION ALL

SELECT 
    'Own games visible to current user' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE created_by = auth.uid();

-- =====================================================
-- 3. CHECK INCOMPLETE GAMES FOR CURRENT USER LOADING
-- =====================================================

-- This simulates what loadCurrentGame() should return
-- Should only return the user's own incomplete games
SELECT 
    id,
    created_by,
    course_name,
    current_hole,
    is_complete,
    created_at
FROM public.games 
WHERE is_complete = FALSE
  AND created_by = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- 4. CHECK ALL INCOMPLETE GAMES (for comparison)
-- =====================================================

-- Show all incomplete games (for admin dashboard view)
SELECT 
    id,
    created_by,
    course_name,
    current_hole,
    is_complete,
    created_at,
    CASE 
        WHEN created_by = auth.uid() THEN 'Own Game'
        ELSE 'Other User Game'
    END as ownership
FROM public.games 
WHERE is_complete = FALSE
ORDER BY created_at DESC;

-- =====================================================
-- 5. VERIFY POLICY BEHAVIOR
-- =====================================================

-- Check UPDATE policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'games'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
