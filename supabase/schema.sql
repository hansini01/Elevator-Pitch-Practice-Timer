-- PitchPerfect AI: Supabase Database Schema & RLS Policies
-- Apply this file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'profiles' table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_duration_seconds INTEGER DEFAULT 60,
  preferred_wpm INTEGER DEFAULT 140,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create 'pitches' table
CREATE TABLE IF NOT EXISTS public.pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Custom',
  script TEXT NOT NULL,
  target_duration_seconds INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create 'practice_sessions' table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE SET NULL,
  pitch_title TEXT NOT NULL,
  category TEXT DEFAULT 'Custom',
  script_used TEXT,
  target_duration_seconds INTEGER NOT NULL,
  actual_duration_seconds INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed', -- 'Completed', 'Incomplete', 'Analyzed'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create 'pitch_feedback' table
CREATE TABLE IF NOT EXISTS public.pitch_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  hook_suggestion TEXT,
  closing_suggestion TEXT,
  refined_pitch TEXT,
  refined_wpm_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_pitches_user_id ON public.pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_pitch_id ON public.practice_sessions(pitch_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pitch_feedback_session_id ON public.pitch_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_pitch_feedback_user_id ON public.pitch_feedback(user_id);

-- 7. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_feedback ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 9. RLS Policies: Pitches
DROP POLICY IF EXISTS "Users can view their own pitches" ON public.pitches;
CREATE POLICY "Users can view their own pitches" 
  ON public.pitches FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own pitches" ON public.pitches;
CREATE POLICY "Users can create their own pitches" 
  ON public.pitches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pitches" ON public.pitches;
CREATE POLICY "Users can update their own pitches" 
  ON public.pitches FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pitches" ON public.pitches;
CREATE POLICY "Users can delete their own pitches" 
  ON public.pitches FOR DELETE 
  USING (auth.uid() = user_id);

-- 10. RLS Policies: Practice Sessions
DROP POLICY IF EXISTS "Users can view their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can view their own practice sessions" 
  ON public.practice_sessions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can insert their own practice sessions" 
  ON public.practice_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can update their own practice sessions" 
  ON public.practice_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can delete their own practice sessions" 
  ON public.practice_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- 11. RLS Policies: Pitch Feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.pitch_feedback;
CREATE POLICY "Users can view their own feedback" 
  ON public.pitch_feedback FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.pitch_feedback;
CREATE POLICY "Users can insert their own feedback" 
  ON public.pitch_feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own feedback" ON public.pitch_feedback;
CREATE POLICY "Users can update their own feedback" 
  ON public.pitch_feedback FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own feedback" ON public.pitch_feedback;
CREATE POLICY "Users can delete their own feedback" 
  ON public.pitch_feedback FOR DELETE 
  USING (auth.uid() = user_id);

-- 12. Auto Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
