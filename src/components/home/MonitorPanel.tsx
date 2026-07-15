import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

/**
 * The page's signature element: a live "integrity monitor" instrument
 * panel. It pairs a real ticking exam clock with a status ledger and a
 * scanning signal line — the visual metaphor for continuous, ongoing
 * proctoring that the rest of the page echoes as a thin divider motif.
 */
export function MonitorPanel() {
  const [secondsLeft, setSecondsLeft] = useState(29 * 60 + 45);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 29 * 60 + 45 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-3 rounded-2xl bg-accent/10 blur-2xl" aria-hidden="true" />
      <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        {/* exam readout */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Database Systems &middot; Final Test
            </p>
            <p className="font-display text-sm font-semibold mt-0.5">Question 12 of 20</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Time left
            </p>
            <p className="font-mono text-lg font-medium tabular-nums text-accent">
              {mm}:{ss}
            </p>
          </div>
        </div>

        {/* fake question lines */}
        <div className="px-5 py-5 space-y-3">
          {[
            { w: "w-full", active: false },
            { w: "w-5/6", active: false },
            { w: "w-4/6", active: true },
            { w: "w-3/6", active: false },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  row.active ? "border-accent bg-accent" : "border-border"
                }`}
              />
              <span className={`h-2.5 rounded-full bg-muted ${row.w}`} />
            </div>
          ))}
        </div>

        {/* scanning signal line — the recurring motif */}
        <div className="border-t border-border px-5 py-3">
          <svg viewBox="0 0 200 28" className="h-6 w-full" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points="0,14 40,14 48,4 56,24 64,14 100,14 108,6 116,22 124,14 200,14"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* monitoring status ledger */}
        <div className="bg-primary text-primary-foreground px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">You are being monitored</span>
            <span className="ml-auto flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          <dl className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
              <dt className="text-primary-foreground/60 uppercase tracking-wide text-[10px]">
                Tab switches
              </dt>
              <dd className="text-base font-semibold mt-0.5">0</dd>
            </div>
            <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
              <dt className="text-primary-foreground/60 uppercase tracking-wide text-[10px]">
                Focus
              </dt>
              <dd className="text-base font-semibold mt-0.5 text-accent">Active</dd>
            </div>
            <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
              <dt className="text-primary-foreground/60 uppercase tracking-wide text-[10px]">
                Warnings
              </dt>
              <dd className="text-base font-semibold mt-0.5">0/3</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
