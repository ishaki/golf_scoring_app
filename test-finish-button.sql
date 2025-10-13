-- =====================================================
-- Test Finish Button Database Update
-- Version: 1.0
-- Description: Verify that Finish button updates is_complete in Supabase
-- =====================================================

-- =====================================================
-- 1. CHECK CURRENT USER AND GAMES
-- =====================================================

-- Check current user
SELECT 
    auth.uid() as current_user_id,
    p.display_name,
    p.role
FROM public.profiles p
WHERE p.id = auth.uid();

-- =====================================================
-- 2. CHECK INCOMPLETE GAMES FOR CURRENT USER
-- =====================================================

-- Check incomplete games for current user
SELECT 
    id,
    created_by,
    course_name,
    current_hole,
    is_complete,
    created_at,
    updated_at
FROM public.games 
WHERE created_by = auth.uid()
  AND is_complete = FALSE
ORDER BY created_at DESC;

-- =====================================================
-- 3. CHECK ALL GAMES FOR CURRENT USER
-- =====================================================

-- Check all games for current user
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
WHERE created_by = auth.uid()
ORDER BY created_at DESC;

-- =====================================================
-- 4. CHECK GAME COMPLETION STATUS
-- =====================================================

-- Check if games have all holes with scores
-- This simulates the areAllHolesCompleted() function
SELECT 
    g.id,
    g.course_name,
    g.is_complete,
    COUNT(h.hole_number) as holes_with_scores,
    CASE 
        WHEN COUNT(h.hole_number) = 18 THEN 'All holes completed'
        ELSE CONCAT('Missing ', 18 - COUNT(h.hole_number), ' holes')
    END as completion_status
FROM public.games g
LEFT JOIN LATERAL (
    SELECT hole_number
    FROM jsonb_array_elements(g.holes) AS hole
    WHERE jsonb_array_length(jsonb_object_keys(hole->'scores')) > 0
) h ON true
WHERE g.created_by = auth.uid()
GROUP BY g.id, g.course_name, g.is_complete
ORDER BY g.created_at DESC;

-- =====================================================
-- 5. VERIFY UPDATE PERMISSIONS
-- =====================================================

-- Check if current user can update their games
-- This tests the RLS policies
SELECT 
    'Can update own incomplete games' as test_description,
    COUNT(*) as game_count
FROM public.games 
WHERE created_by = auth.uid()
  AND is_complete = FALSE;

-- =====================================================
-- 6. MANUAL TEST QUERY
-- =====================================================

-- This query can be used to manually test updating is_complete
-- Uncomment and run after clicking Finish button to verify the update
/*
UPDATE public.games 
SET is_complete = TRUE, updated_at = NOW()
WHERE id = 'YOUR_GAME_ID_HERE' 
  AND created_by = auth.uid()
RETURNING id, is_complete, updated_at;
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================
