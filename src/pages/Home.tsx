import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Stats } from "@/components/home/Stats";
import { Faqs } from "@/components/home/Faqs";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Stats />
        <Faqs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
