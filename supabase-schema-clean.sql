-- =====================================================
-- Golf Scoring System - Supabase Database Schema
-- Version: 2.1 (Clean Install)
-- =====================================================
-- IMPORTANT: This will DROP existing tables!
-- Only run on a fresh database or if you want to reset everything
-- =====================================================

-- Drop existing tables (in reverse order due to dependencies)
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX profiles_id_idx ON public.profiles(id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. COURSES TABLE
-- =====================================================

CREATE TABLE public.courses (
  id TEXT PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('9-hole', '18-hole')),
  holes JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX courses_created_by_idx ON public.courses(created_by);
CREATE INDEX courses_type_idx ON public.courses(type);
CREATE INDEX courses_is_default_idx ON public.courses(is_default);
CREATE INDEX courses_is_public_idx ON public.courses(is_public);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view courses"
  ON public.courses FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_default = TRUE
    OR is_public = TRUE
    OR created_by IS NULL
  );

CREATE POLICY "Authenticated users can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

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

CREATE POLICY "Users can delete their own courses only"
  ON public.courses FOR DELETE
  USING (
    created_by = auth.uid()
    AND is_default = FALSE
  );

-- =====================================================
-- 3. GAMES TABLE
-- =====================================================

CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT,
  players JSONB NOT NULL,
  holes JSONB NOT NULL,
  current_hole INTEGER DEFAULT 1 CHECK (current_hole >= 1 AND current_hole <= 18),
  totals JSONB DEFAULT '{}'::jsonb,
  is_complete BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  public_token UUID DEFAULT uuid_generate_v4() UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX games_created_by_idx ON public.games(created_by);
CREATE INDEX games_public_token_idx ON public.games(public_token);
CREATE INDEX games_is_complete_idx ON public.games(is_complete);
CREATE INDEX games_is_public_idx ON public.games(is_public);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Anyone can view public games"
  ON public.games FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own incomplete games"
  ON public.games FOR UPDATE
  USING (
    created_by = auth.uid()
    AND is_complete = FALSE
  )
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own games"
  ON public.games FOR DELETE
  USING (created_by = auth.uid());

-- =====================================================
-- 4. FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. DEFAULT COURSES
-- =====================================================

INSERT INTO public.courses (id, name, type, holes, is_default, is_public)
VALUES
  (
    'default-standard',
    'Standard Par 72',
    '18-hole',
    '[
      {"number": 1, "strokeIndex": 1, "par": 4},
      {"number": 2, "strokeIndex": 11, "par": 4},
      {"number": 3, "strokeIndex": 5, "par": 3},
      {"number": 4, "strokeIndex": 15, "par": 5},
      {"number": 5, "strokeIndex": 3, "par": 4},
      {"number": 6, "strokeIndex": 13, "par": 4},
      {"number": 7, "strokeIndex": 7, "par": 3},
      {"number": 8, "strokeIndex": 17, "par": 4},
      {"number": 9, "strokeIndex": 9, "par": 5},
      {"number": 10, "strokeIndex": 2, "par": 4},
      {"number": 11, "strokeIndex": 12, "par": 4},
      {"number": 12, "strokeIndex": 6, "par": 4},
      {"number": 13, "strokeIndex": 16, "par": 3},
      {"number": 14, "strokeIndex": 4, "par": 5},
      {"number": 15, "strokeIndex": 14, "par": 4},
      {"number": 16, "strokeIndex": 8, "par": 4},
      {"number": 17, "strokeIndex": 18, "par": 3},
      {"number": 18, "strokeIndex": 10, "par": 4}
    ]'::jsonb,
    TRUE,
    TRUE
  ),
  (
    'default-executive',
    'Executive Course',
    '18-hole',
    '[
      {"number": 1, "strokeIndex": 1, "par": 4},
      {"number": 2, "strokeIndex": 7, "par": 3},
      {"number": 3, "strokeIndex": 3, "par": 4},
      {"number": 4, "strokeIndex": 13, "par": 3},
      {"number": 5, "strokeIndex": 5, "par": 4},
      {"number": 6, "strokeIndex": 15, "par": 3},
      {"number": 7, "strokeIndex": 9, "par": 5},
      {"number": 8, "strokeIndex": 11, "par": 4},
      {"number": 9, "strokeIndex": 17, "par": 3},
      {"number": 10, "strokeIndex": 2, "par": 4},
      {"number": 11, "strokeIndex": 8, "par": 3},
      {"number": 12, "strokeIndex": 4, "par": 4},
      {"number": 13, "strokeIndex": 14, "par": 3},
      {"number": 14, "strokeIndex": 6, "par": 5},
      {"number": 15, "strokeIndex": 16, "par": 3},
      {"number": 16, "strokeIndex": 10, "par": 4},
      {"number": 17, "strokeIndex": 12, "par": 4},
      {"number": 18, "strokeIndex": 18, "par": 3}
    ]'::jsonb,
    TRUE,
    TRUE
  ),
  (
    'default-championship',
    'Championship Course',
    '18-hole',
    '[
      {"number": 1, "strokeIndex": 5, "par": 4},
      {"number": 2, "strokeIndex": 3, "par": 5},
      {"number": 3, "strokeIndex": 15, "par": 3},
      {"number": 4, "strokeIndex": 1, "par": 4},
      {"number": 5, "strokeIndex": 9, "par": 4},
      {"number": 6, "strokeIndex": 11, "par": 4},
      {"number": 7, "strokeIndex": 17, "par": 3},
      {"number": 8, "strokeIndex": 7, "par": 5},
      {"number": 9, "strokeIndex": 13, "par": 4},
      {"number": 10, "strokeIndex": 6, "par": 4},
      {"number": 11, "strokeIndex": 4, "par": 5},
      {"number": 12, "strokeIndex": 16, "par": 3},
      {"number": 13, "strokeIndex": 2, "par": 4},
      {"number": 14, "strokeIndex": 10, "par": 4},
      {"number": 15, "strokeIndex": 12, "par": 4},
      {"number": 16, "strokeIndex": 18, "par": 3},
      {"number": 17, "strokeIndex": 8, "par": 5},
      {"number": 18, "strokeIndex": 14, "par": 4}
    ]'::jsonb,
    TRUE,
    TRUE
  );

-- =====================================================
-- 6. PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- COMPLETE
-- =====================================================
