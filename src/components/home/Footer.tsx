import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
            <ShieldCheck className="h-4 w-4 text-accent" />
          </span>
          <span className="font-display text-sm font-semibold">ExamGuard</span>
        </div>
        <p className="text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} ExamGuard. Focused, fair, and secure online exams.
        </p>
      </div>
    </footer>
  );
}
