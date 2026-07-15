import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does the monitoring actually work?",
    answer:
      "While a student is inside an exam, ExamGuard watches for the browser tab losing visibility or the window losing focus. Each occurrence counts as a strike, shown live to the student. Reaching the strike limit submits the exam automatically.",
  },
  {
    question: "Do students know they're being monitored?",
    answer:
      "Yes. The exam screen shows monitoring status and the current strike count the entire time, so there's nothing happening that the student can't see for themselves.",
  },
  {
    question: "Why does my account need approval before I can log in?",
    answer:
      "Every new student or lecturer signup is reviewed by an admin first. This keeps exams limited to verified people from your institution rather than anyone who creates an account.",
  },
  {
    question: "What happens if I lose my internet connection mid-exam?",
    answer:
      "Your in-progress answers stay on the exam screen and the timer keeps running against the exam's original duration, the same as it would in a physical exam hall.",
  },
  {
    question: "Can lecturers see why a student was flagged?",
    answer:
      "Yes — each flagged exam includes the type and number of violations, so lecturers can review the context before deciding how to handle a result.",
  },
];

export function Faqs() {
  return (
    <section id="faqs" className="scroll-mt-16 bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">FAQs</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Common questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="font-display text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
