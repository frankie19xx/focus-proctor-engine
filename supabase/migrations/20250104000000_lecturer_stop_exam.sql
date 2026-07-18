-- ============================================================
-- Exam-Guard: let lecturers forcibly end a student's in-progress
-- attempt from the Live Monitoring tab. There was previously no
-- UPDATE policy on `results` for lecturers at all — only the
-- owning student could update their own row.
-- ============================================================

CREATE POLICY "Lecturers can update results for own exams"
  ON public.results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.exams
      WHERE exams.id = results.exam_id AND exams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams
      WHERE exams.id = results.exam_id AND exams.created_by = auth.uid()
    )
  );
