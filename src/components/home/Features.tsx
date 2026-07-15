import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ClipboardList, Zap, PieChart, Eye, UserCheck } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure & monitored",
    description:
      "Real-time monitoring flags tab switches and lost window focus the moment they happen, with a clear strike count instead of a black box.",
  },
  {
    icon: ClipboardList,
    title: "Easy exam management",
    description:
      "Lecturers create, schedule, and manage exams from one dashboard — no separate tools for questions, timing, and results.",
  },
  {
    icon: Zap,
    title: "Instant results",
    description:
      "Multiple-choice exams are graded the moment a student submits, so nobody waits days to know where they stand.",
  },
  {
    icon: PieChart,
    title: "Detailed reports",
    description:
      "Score trends, strike history, and completion times roll up into reports lecturers can actually act on.",
  },
  {
    icon: Eye,
    title: "Transparent to students",
    description:
      "Students see their own strike count and time remaining live, so monitoring never feels like it's happening behind their back.",
  },
  {
    icon: UserCheck,
    title: "Approved accounts only",
    description:
      "Every student and lecturer signup is reviewed by an admin before it's active, keeping exams limited to verified people.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Features</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Why choose ExamGuard?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything an exam needs to be fast to run and fair to sit,
            built around one continuous thread of monitoring from login to
            submission.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border/80">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
