-- =====================================================
-- Migration: Add User Roles (Admin/User)
-- Version: 1.0
-- Description: Adds role-based access control to the application
-- =====================================================

-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Update existing profiles to have 'user' role (if null)
UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL;

-- Create a function to check if user is admin (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for admin access to profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update courses RLS policies for admin access
DROP POLICY IF EXISTS "Users can view courses" ON public.courses;
CREATE POLICY "Users can view courses"
  ON public.courses FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_default = TRUE
    OR is_public = TRUE
    OR created_by IS NULL
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update any course" ON public.courses;
CREATE POLICY "Admins can update any course"
  ON public.courses FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any course" ON public.courses;
CREATE POLICY "Admins can delete any course"
  ON public.courses FOR DELETE
  USING (public.is_admin());

-- Update games RLS policies for admin access
DROP POLICY IF EXISTS "Admins can view all games" ON public.games;
CREATE POLICY "Admins can view all games"
  ON public.games FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any incomplete game" ON public.games;
CREATE POLICY "Admins can update any incomplete game"
  ON public.games FOR UPDATE
  USING (
    is_complete = FALSE
    AND public.is_admin()
  )
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any game" ON public.games;
CREATE POLICY "Admins can delete any game"
  ON public.games FOR DELETE
  USING (public.is_admin());

-- Update handle_new_user function to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the migration
SELECT 
  id, 
  display_name, 
  role, 
  created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;
