-- ============================================================
-- Exam-Guard: Admin role + signup approval workflow
-- Adds: profiles.status, profiles.registration_number, 'admin' role
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. New columns on profiles
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS registration_number TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Allow 'admin' as a role. Drop the old check constraint and recreate it.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'lecturer', 'admin'));

-- ────────────────────────────────────────────────────────────
-- 2. Update the new-user trigger to persist registration_number
--    and always start new accounts as 'pending'. Admin accounts
--    are never self-signed-up (see README) — they're promoted
--    manually, so this trigger never assigns role = 'admin'.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, registration_number, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'lecturer' THEN 'lecturer'
      ELSE 'student'
    END,
    NEW.raw_user_meta_data->>'registration_number',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────
-- 3. Admins can view and update every profile (needed to
--    approve/reject signups and manage roles).
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 4. Gate exam access behind approval status, not just role.
--    A signed-in-but-pending account should not be able to pull
--    exam content or submit results even by calling the API
--    directly.
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can view active exams" ON public.exams;
CREATE POLICY "Approved users can view active exams"
  ON public.exams FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.questions;
CREATE POLICY "Approved users can view questions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams
      WHERE exams.id = questions.exam_id AND exams.is_active = true
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Students can create own results" ON public.results;
CREATE POLICY "Approved students can create own results"
  ON public.results FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.status = 'approved'
    )
  );

-- IMPORTANT (manual step): there is no signup path that creates an
-- admin — by design, nobody should be able to grant themselves admin
-- through the public signup form. To create your first admin, sign up
-- normally through the app, then run this once in the Supabase SQL
-- editor (swap in the real email):
--
--   UPDATE public.profiles
--   SET role = 'admin', status = 'approved'
--   WHERE email = 'you@example.com';
