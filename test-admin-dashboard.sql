-- =====================================================
-- Test Admin Dashboard Access
-- Version: 1.0
-- Description: Verify admin can view all games including completed ones
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT USER AND ROLE
-- =====================================================

-- Check current user and role
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
-- 2. CHECK ALL GAMES (ADMIN VIEW)
-- =====================================================

-- Check all games (should work for admin)
SELECT 
    id,
    created_by,
    course_name,
    current_hole,
    is_complete,
    created_at,
    updated_at,
    CASE 
        WHEN is_complete THEN 'Complete'
        ELSE 'In Progress'
    END as status
FROM public.games 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 3. CHECK GAMES WITH CREATOR INFO
-- =====================================================

-- Check games with creator display name (admin dashboard query)
SELECT 
    g.id,
    g.created_by,
    g.course_name,
    g.current_hole,
    g.is_complete,
    g.created_at,
    g.updated_at,
    p.display_name as creator_name,
    CASE 
        WHEN g.is_complete THEN 'Complete'
        ELSE 'In Progress'
    END as status
FROM public.games g
LEFT JOIN public.profiles p ON g.created_by = p.id
ORDER BY g.created_at DESC
LIMIT 10;

-- =====================================================
-- 4. CHECK RLS POLICIES FOR GAMES
-- =====================================================

-- Check current RLS policies for games table
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
-- 5. TEST ADMIN ACCESS TO GAMES
-- =====================================================

-- Test if current user can view all games (admin policy)
SELECT 
    'Can view all games as admin' as test_description,
    COUNT(*) as game_count
FROM public.games;

-- =====================================================
-- 6. CHECK SPECIFIC GAME ACCESS
-- =====================================================

-- Check if we can access the specific game that was just completed
-- Replace 'GAME_ID_HERE' with the actual game ID from the logs
/*
SELECT 
    id,
    created_by,
    course_name,
    is_complete,
    created_at,
    updated_at
FROM public.games 
WHERE id = 'GAME_ID_HERE';
*/

-- =====================================================
-- 7. CHECK FOREIGN KEY RELATIONSHIP
-- =====================================================

-- Check if the foreign key relationship exists
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'games'
    AND kcu.column_name = 'created_by';

-- =====================================================
-- END OF SCRIPT
-- =====================================================
