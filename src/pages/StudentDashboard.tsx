import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard, type ExamForStudent } from "@/components/Dashboard";
import { ExamInterface } from "@/components/ExamInterface";
import { ResultsPage } from "@/components/ResultsPage";

interface ExamResult {
  score: number;
  strikes: number;
  totalQuestions: number;
}

type View =
  | { name: "dashboard" }
  | { name: "exam"; exam: ExamForStudent }
  | { name: "results"; result: ExamResult };

export default function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>({ name: "dashboard" });

  if (view.name === "exam") {
    return (
      <ExamInterface
        examId={view.exam.id}
        examTitle={view.exam.title}
        duration={view.exam.duration}
        onFinish={(result) => setView({ name: "results", result })}
      />
    );
  }

  if (view.name === "results") {
    return (
      <ResultsPage
        score={view.result.score}
        strikes={view.result.strikes}
        totalQuestions={view.result.totalQuestions}
        onBackToDashboard={() => setView({ name: "dashboard" })}
      />
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 pt-6 flex justify-end">
        <button
          onClick={signOut}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Sign out
        </button>
      </div>
      <Dashboard
        studentName={profile?.full_name ?? profile?.email ?? "there"}
        onStartExam={(exam) => setView({ name: "exam", exam })}
      />
    </div>
  );
}
