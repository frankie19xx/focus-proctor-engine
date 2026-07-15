import { Users, GraduationCap, FileCheck2, Trophy } from "lucide-react";

const STATS = [
  { icon: Users, value: "1,250+", label: "Registered students" },
  { icon: GraduationCap, value: "85+", label: "Active lecturers" },
  { icon: FileCheck2, value: "320+", label: "Examinations conducted" },
  { icon: Trophy, value: "98%", label: "Completion rate" },
];

export function Stats() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 divide-y divide-primary-foreground/10 lg:grid-cols-4 lg:divide-y-0 lg:divide-x">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 py-4 lg:justify-center lg:py-2 lg:px-6">
              <stat.icon className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-mono text-xl font-semibold leading-none tabular-nums">{stat.value}</p>
                <p className="mt-1 text-xs text-primary-foreground/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
