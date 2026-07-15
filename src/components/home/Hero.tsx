import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MonitorPanel } from "./MonitorPanel";
import { Monitor, Info } from "lucide-react";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="scroll-mt-16 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_45%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Secure. Reliable. Fair.
          </span>

          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            A secure online
            <br />
            <span className="text-accent">examination</span> system
          </h1>

          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            ExamGuard helps institutions run online exams with real-time
            focus monitoring, automated grading, and clear performance
            reports — for lecturers and students alike.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2" onClick={() => navigate("/signup")}>
              <Monitor className="h-4 w-4" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href="#about">
                <Info className="h-4 w-4" />
                Learn More
              </a>
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <MonitorPanel />
        </div>
      </div>
    </section>
  );
}
