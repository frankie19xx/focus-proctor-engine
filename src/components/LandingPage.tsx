import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Monitor, AlertCircle, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="h-6 w-6" />
          <span>Exam-Guard</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Features</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Pricing</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">About</a>
          <a className="text-sm font-medium hover:underline underline-offset-4" href="#">Contact</a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure Online Exams with <span className="text-primary">Anti-Cheating</span> Tech
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Exam-Guard ensures academic integrity with advanced tab-switching detection and focused environment monitoring.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={onStart}>
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">Learn More</Button>
                </div>
              </div>
              <img
                alt="Exam Security"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/7b225105-8607-49a5-84ee-0325e9a1983e/hero-image-exam-guard-62e8bf78-1782997569265.webp"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to conduct high-stakes examinations remotely without compromising on security.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-lg bg-card">
                <Monitor className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Tab Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Detects when students switch tabs or applications and triggers instant warnings.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-lg bg-card">
                <AlertCircle className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Strike System</h3>
                <p className="text-sm text-muted-foreground">
                  Configurable violation limits that automatically submit exams upon repeated attempts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 border rounded-lg bg-card">
                <Lock className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Locked Environment</h3>
                <p className="text-sm text-muted-foreground">
                  Encourages focus by preventing window resizing and focus loss during the test.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 Exam-Guard Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</a>
          <a className="text-xs hover:underline underline-offset-4" href="#">Privacy Policy</a>
        </nav>
      </footer>
    </div>
  );
};
