-- =====================================================
-- Recreate All RLS Policies
-- Version: 1.0
-- Description: Drops and recreates all RLS policies for profiles, courses, and games tables
-- =====================================================

-- =====================================================
-- 1. DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Drop courses policies
DROP POLICY IF EXISTS "Users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update their own courses only" ON public.courses;
DROP POLICY IF EXISTS "Admins can update any course" ON public.courses;
DROP POLICY IF EXISTS "Users can delete their own courses only" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete any course" ON public.courses;

-- Drop games policies
DROP POLICY IF EXISTS "Users can view their own games" ON public.games;
DROP POLICY IF EXISTS "Admins can view all games" ON public.games;
DROP POLICY IF EXISTS "Anyone can view public games" ON public.games;
DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
DROP POLICY IF EXISTS "Users can update their own incomplete games" ON public.games;
DROP POLICY IF EXISTS "Admins can update any incomplete game" ON public.games;
DROP POLICY IF EXISTS "Users can delete their own games" ON public.games;
DROP POLICY IF EXISTS "Admins can delete any game" ON public.games;

-- =====================================================
-- 2. CREATE IS_ADMIN FUNCTION (if not exists)
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. RECREATE PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- 4. RECREATE COURSES POLICIES
-- =====================================================

-- Users can view courses
CREATE POLICY "Users can view courses"
  ON public.courses FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_default = TRUE
    OR is_public = TRUE
    OR created_by IS NULL
    OR public.is_admin()
  );

-- Authenticated users can insert courses
CREATE POLICY "Authenticated users can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
    AND is_default = FALSE
  );

-- Users can update their own courses only
CREATE POLICY "Users can update their own courses only"
  ON public.courses FOR UPDATE
  USING (
    created_by = auth.uid()
    AND is_default = FALSE
  )
  WITH CHECK (
    created_by = auth.uid()
    AND is_default = FALSE
  );

-- Admins can update any course
CREATE POLICY "Admins can update any course"
  ON public.courses FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can delete their own courses only
CREATE POLICY "Users can delete their own courses only"
  ON public.courses FOR DELETE
  USING (
    created_by = auth.uid()
    AND is_default = FALSE
  );

-- Admins can delete any course
CREATE POLICY "Admins can delete any course"
  ON public.courses FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- 5. RECREATE GAMES POLICIES
-- =====================================================

-- Users can view their own games
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (created_by = auth.uid());

-- Admins can view all games
CREATE POLICY "Admins can view all games"
  ON public.games FOR SELECT
  USING (public.is_admin());

-- Anyone can view public games
CREATE POLICY "Anyone can view public games"
  ON public.games FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- Users can update their own incomplete games
CREATE POLICY "Users can update their own incomplete games"
  ON public.games FOR UPDATE
  USING (
    created_by = auth.uid()
    AND is_complete = FALSE
  )
  WITH CHECK (created_by = auth.uid());

-- Admins can update any incomplete game
CREATE POLICY "Admins can update any incomplete game"
  ON public.games FOR UPDATE
  USING (
    is_complete = FALSE
    AND public.is_admin()
  )
  WITH CHECK (public.is_admin());

-- Users can delete their own games
CREATE POLICY "Users can delete their own games"
  ON public.games FOR DELETE
  USING (created_by = auth.uid());

-- Admins can delete any game
CREATE POLICY "Admins can delete any game"
  ON public.games FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- 6. VERIFY POLICIES CREATED
-- =====================================================

-- Check profiles policies
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check courses policies
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
WHERE tablename = 'courses'
ORDER BY policyname;

-- Check games policies
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
-- END OF SCRIPT
-- =====================================================
