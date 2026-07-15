import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Moon, Sun, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faqs", label: "FAQs" },
  { href: "#contact", label: "Contact" },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("examguard-theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("examguard-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export function Navbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [activeHash, setActiveHash] = useState("#home");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => !!el,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveHash(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">ExamGuard</span>
            <span className="block text-[11px] text-muted-foreground -mt-0.5">
              Secure Online Examination System
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                activeHash === link.href
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-foreground/90"
            >
              {link.label}
            </a>
          ))}
          <Button className="w-full mt-2" onClick={() => navigate("/login")}>
            Login
          </Button>
        </div>
      )}
    </header>
  );
}
