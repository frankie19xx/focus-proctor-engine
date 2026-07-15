import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, Clock } from "lucide-react";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    detail: "support@examguard.app",
    note: "For account approvals, exam issues, or general questions.",
  },
  {
    icon: MessageCircle,
    title: "Report a problem",
    detail: "Use the in-app feedback button",
    note: "Fastest way to flag something during a live exam.",
  },
  {
    icon: Clock,
    title: "Response time",
    detail: "Within 1 business day",
    note: "Admin approvals are usually reviewed same-day.",
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Contact</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Talk to us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions about setting up ExamGuard for your institution, or
            something wrong with an exam? Reach out through any of these.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {CHANNELS.map((channel) => (
            <Card key={channel.title} className="border-border/80">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <channel.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display mt-3 text-base font-semibold">{channel.title}</h3>
                <p className="mt-1 text-sm font-medium">{channel.detail}</p>
                <p className="mt-1 text-sm text-muted-foreground">{channel.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
