-- ============================================================
-- Exam-Guard: Initial Database Schema
-- Tables: profiles, exams, questions, results, cheating_logs
-- RLS: auth.uid()-based policies for role-based access
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Extends auth.users with role and display name
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'lecturer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles are visible to other authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. EXAMS TABLE
-- Stores exam definitions created by lecturers
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_questions INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_exams_created_by ON public.exams(created_by);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON public.exams(is_active);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Policies: All authenticated users can read active exams
CREATE POLICY "Authenticated users can view active exams"
  ON public.exams FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Only lecturers can create exams
CREATE POLICY "Lecturers can create exams"
  ON public.exams FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'lecturer'
    )
  );

-- Lecturers can update their own exams
CREATE POLICY "Lecturers can update own exams"
  ON public.exams FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- Lecturers can delete their own exams
CREATE POLICY "Lecturers can delete own exams"
  ON public.exams FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- ────────────────────────────────────────────────────────────
-- 3. QUESTIONS TABLE
-- Stores multiple-choice questions for each exam
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_number ON public.questions(exam_id, question_number);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read questions (for taking exams)
CREATE POLICY "Authenticated users can view questions"
  ON public.questions FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id AND exams.is_active = true
    )
  );

-- Only lecturers who own the exam can manage questions
CREATE POLICY "Lecturers can insert questions for own exams"
  ON public.questions FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id AND exams.created_by = auth.uid()
    )
  );

CREATE POLICY "Lecturers can update questions for own exams"
  ON public.questions FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id AND exams.created_by = auth.uid()
    )
  );

CREATE POLICY "Lecturers can delete questions for own exams"
  ON public.questions FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.exams 
      WHERE exams.id = questions.exam_id AND exams.created_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 4. RESULTS TABLE
-- Stores exam submission results
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  strikes INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'auto_submitted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam_id ON public.results(exam_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON public.results(status);
CREATE INDEX IF NOT EXISTS idx_results_student_exam ON public.results(student_id, exam_id);

-- Enable RLS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Students can view their own results
CREATE POLICY "Students can view own results"
  ON public.results FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create their own results (start an exam)
CREATE POLICY "Students can create own results"
  ON public.results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own results (submit exam)
CREATE POLICY "Students can update own results"
  ON public.results FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Lecturers can view all results
CREATE POLICY "Lecturers can view all results"
  ON public.results FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'lecturer'
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. CHEATING LOGS TABLE
-- Records anti-cheating violations during exams
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cheating_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES public.results(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('tab_switch', 'window_blur', 'fullscreen_exit', 'copy_attempt', 'right_click', 'other')),
  description TEXT,
  violation_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cheating_logs_result_id ON public.cheating_logs(result_id);
CREATE INDEX IF NOT EXISTS idx_cheating_logs_student_id ON public.cheating_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_cheating_logs_created_at ON public.cheating_logs(created_at);

-- Enable RLS
ALTER TABLE public.cheating_logs ENABLE ROW LEVEL SECURITY;

-- Students can view their own cheating logs
CREATE POLICY "Students can view own cheating logs"
  ON public.cheating_logs FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create cheating logs (logged by the frontend during exam)
CREATE POLICY "Students can create own cheating logs"
  ON public.cheating_logs FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Lecturers can view all cheating logs
CREATE POLICY "Lecturers can view all cheating logs"
  ON public.cheating_logs FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'lecturer'
    )
  );

-- ────────────────────────────────────────────────────────────
-- 6. HELPER FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get exam statistics for a student
CREATE OR REPLACE FUNCTION public.get_student_stats(p_student_id UUID)
RETURNS JSON AS $$
DECLARE
  v_completed INTEGER;
  v_pending INTEGER;
  v_avg_score NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_completed
  FROM public.results
  WHERE student_id = p_student_id AND status = 'completed';

  SELECT COUNT(*) INTO v_pending
  FROM public.exams e
  WHERE e.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM public.results r 
      WHERE r.exam_id = e.id AND r.student_id = p_student_id AND r.status = 'completed'
    );

  SELECT COALESCE(AVG(
    (score::NUMERIC / NULLIF(total_questions, 0)) * 100
  ), 0) INTO v_avg_score
  FROM public.results
  WHERE student_id = p_student_id AND status = 'completed';

  RETURN json_build_object(
    'completed_exams', v_completed,
    'pending_exams', v_pending,
    'average_score', ROUND(v_avg_score, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
