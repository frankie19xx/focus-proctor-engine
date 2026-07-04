import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <ShieldCheck className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-3">ExamGuard</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Focused, fair, and secure online exams for students and lecturers.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={() => navigate("/login")}>
          Log In
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/signup")}>
          Create Account
        </Button>
      </div>
    </div>
  );
}
