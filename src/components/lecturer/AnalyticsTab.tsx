import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Result, CheatingLog } from "@/types/exam";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const VIOLATION_LABELS: Record<string, string> = {
  tab_switch: "Tab Switch",
  window_blur: "Window Blur",
  fullscreen_exit: "Fullscreen Exit",
  copy_attempt: "Copy Attempt",
  right_click: "Right Click",
  other: "Other",
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

const SCORE_BUCKETS = ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"];

export function AnalyticsTab() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [violations, setViolations] = useState<CheatingLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("created_by", user.id);

    if (examError) {
      toast.error("Couldn't load analytics", { description: examError.message });
      setLoading(false);
      return;
    }

    const myExams = (examData ?? []) as Exam[];
    setExams(myExams);

    if (myExams.length === 0) {
      setResults([]);
      setViolations([]);
      setLoading(false);
      return;
    }

    const examIds = myExams.map((e) => e.id);
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .select("*")
      .in("exam_id", examIds);

    if (resultError) {
      toast.error("Couldn't load results", { description: resultError.message });
      setLoading(false);
      return;
    }

    const allResults = (resultData ?? []) as Result[];
    setResults(allResults);

    const resultIds = allResults.map((r) => r.id);
    if (resultIds.length > 0) {
      const { data: logData, error: logError } = await supabase
        .from("cheating_logs")
        .select("*")
        .in("result_id", resultIds);

      if (!logError) setViolations((logData ?? []) as CheatingLog[]);
    } else {
      setViolations([]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const completedResults = useMemo(
    () => results.filter((r) => r.status !== "in_progress"),
    [results],
  );

  const avgScoreByExam = useMemo(() => {
    return exams
      .map((exam) => {
        const examResults = completedResults.filter(
          (r) => r.exam_id === exam.id && r.total_questions > 0,
        );
        if (examResults.length === 0) return { name: exam.title, avg: 0, attempts: 0 };
        const avg =
          examResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) /
          examResults.length;
        return { name: exam.title, avg: Math.round(avg), attempts: examResults.length };
      })
      .filter((e) => e.attempts > 0);
  }, [exams, completedResults]);

  const scoreDistribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    for (const r of completedResults) {
      if (r.total_questions === 0) continue;
      const pct = (r.score / r.total_questions) * 100;
      const idx = Math.min(4, Math.floor(pct / 20));
      buckets[idx]++;
    }
    return SCORE_BUCKETS.map((label, i) => ({ name: label, count: buckets[i] }));
  }, [completedResults]);

  const violationBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of violations) {
      counts[v.violation_type] = (counts[v.violation_type] ?? 0) + 1;
    }
    return Object.entries(counts).map(([type, count]) => ({
      name: VIOLATION_LABELS[type] ?? type,
      value: count,
    }));
  }, [violations]);

  const overallAvg = useMemo(() => {
    const withQuestions = completedResults.filter((r) => r.total_questions > 0);
    if (withQuestions.length === 0) return 0;
    return Math.round(
      withQuestions.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) /
        withQuestions.length,
    );
  }, [completedResults]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Create an exam and collect a few submissions to see analytics here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallAvg}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedResults.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Violations Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{violations.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Score by Exam</CardTitle>
            <CardDescription>Based on completed attempts only</CardDescription>
          </CardHeader>
          <CardContent>
            {avgScoreByExam.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No completed attempts yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={avgScoreByExam} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Avg score"]} />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>How completed attempts spread across score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {completedResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">No completed attempts yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={scoreDistribution} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Violation Types</CardTitle>
            <CardDescription>Anti-cheating flags raised across all your exams</CardDescription>
          </CardHeader>
          <CardContent>
            {violationBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-16 text-center">
                No integrity violations recorded. 🎉
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={violationBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {violationBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
