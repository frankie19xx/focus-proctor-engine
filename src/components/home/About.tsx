import { ScanDivider } from "./ScanDivider";

export function About() {
  return (
    <section id="about" className="scroll-mt-16">
      <ScanDivider />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">About ExamGuard</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Exams you can trust, without the exam hall
            </h2>
          </div>

          <div className="space-y-5 text-muted-foreground">
            <p>
              ExamGuard started from a simple problem: moving exams online
              shouldn't mean giving up on academic integrity. Institutions
              needed a way to let students test from anywhere while giving
              lecturers the same confidence they'd have proctoring a room in
              person.
            </p>
            <p>
              We built a lightweight monitor that watches for the moments
              that matter — a student leaving the tab, losing window focus,
              or exceeding a fair number of warnings — and logs every one of
              them for review, without turning the exam into a surveillance
              exercise.
            </p>
            <p>
              Today ExamGuard is used by lecturers running timed tests and
              by students who just want a fair, distraction-free place to
              take them. Every account is reviewed by an administrator before
              it goes live, so every dashboard on the platform belongs to a
              verified student or lecturer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
