const STEPS = [
  {
    n: "01",
    title: "Create an account",
    description: "Sign up as a student with your registration number, or as a lecturer with your institutional email.",
  },
  {
    n: "02",
    title: "Get approved",
    description: "An admin reviews every new signup. You'll be able to sign in as soon as your account is approved.",
  },
  {
    n: "03",
    title: "Take or run an exam",
    description: "Students sit timed, monitored exams. Lecturers create exams and watch submissions come in live.",
  },
  {
    n: "04",
    title: "See the results",
    description: "Multiple-choice exams grade instantly, with strike history included, so nothing is left ambiguous.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">How it works</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            From signup to results, in four steps
          </h2>
        </div>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.n} className="relative pl-0">
              <span className="font-display block text-4xl font-semibold text-accent/25">
                {step.n}
              </span>
              <h3 className="font-display mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              {i < STEPS.length - 1 && (
                <span
                  className="pointer-events-none absolute right-[-1.25rem] top-4 hidden h-px w-6 bg-border sm:block lg:right-[-1rem] lg:w-8"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
