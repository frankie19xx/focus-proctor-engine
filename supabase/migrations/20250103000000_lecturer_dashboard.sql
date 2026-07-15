-- ============================================================
-- Exam-Guard: Lecturer dashboard support
-- - Lecturers need to see their own exams/questions even when
--   draft (is_active = false), which the original policies
--   (scoped to active exams for approved users) don't cover.
-- - Enable realtime so the lecturer dashboard can watch
--   in-progress attempts and violations live.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Lecturers can view their own exams regardless of is_active
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Lecturers can view own exams"
  ON public.exams FOR SELECT
  USING (created_by = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 2. Lecturers can view questions belonging to their own exams
--    regardless of is_active
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Lecturers can view questions for own exams"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams
      WHERE exams.id = questions.exam_id AND exams.created_by = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 3. Keep exams.total_questions in sync automatically so the
--    lecturer dashboard doesn't have to compute it client-side.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_exam_question_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.exams
  SET total_questions = (
    SELECT COUNT(*) FROM public.questions WHERE exam_id = COALESCE(NEW.exam_id, OLD.exam_id)
  )
  WHERE id = COALESCE(NEW.exam_id, OLD.exam_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_exam_question_count_ins ON public.questions;
CREATE TRIGGER sync_exam_question_count_ins
  AFTER INSERT OR DELETE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.sync_exam_question_count();

-- ────────────────────────────────────────────────────────────
-- 4. Realtime: allow the lecturer live-monitoring view to
--    subscribe to in-progress attempts and violation events.
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cheating_logs;
