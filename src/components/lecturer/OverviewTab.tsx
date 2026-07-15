import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Result } from "@/types/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Users, TrendingUp, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalExams, setTotalExams] = useState(0);
  const [activeExams, setActiveExams] = useState(0);
  const [studentsMonitored, setStudentsMonitored] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [violationsThisWeek, setViolationsThisWeek] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("created_by", user.id);

    if (examError) {
      toast.error("Couldn't load dashboard stats", { description: examError.message });
      setLoading(false);
      return;
    }

    const myExams = (examData ?? []) as Exam[];
    setTotalExams(myExams.length);
    setActiveExams(myExams.filter((e) => e.is_active).length);

    const examIds = myExams.map((e) => e.id);
    if (examIds.length === 0) {
      setStudentsMonitored(0);
      setAvgScore(0);
      setViolationsThisWeek(0);
      setLoading(false);
      return;
    }

    const { data: resultData } = await supabase.from("results").select("*").in("exam_id", examIds);
    const results = (resultData ?? []) as Result[];

    setStudentsMonitored(new Set(results.map((r) => r.student_id)).size);

    const completed = results.filter((r) => r.status !== "in_progress" && r.total_questions > 0);
    setAvgScore(
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) /
              completed.length,
          ),
    );

    const resultIds = results.map((r) => r.id);
    if (resultIds.length > 0) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("cheating_logs")
        .select("*", { count: "exact", head: true })
        .in("result_id", resultIds)
        .gte("created_at", weekAgo);
      setViolationsThisWeek(count ?? 0);
    } else {
      setViolationsThisWeek(0);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    {
      label: "Total Exams",
      value: totalExams,
      sub: `${activeExams} active`,
      icon: Award,
      color: "text-primary",
    },
    {
      label: "Students Monitored",
      value: studentsMonitored,
      sub: "Unique students with attempts",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Avg. Score",
      value: `${avgScore}%`,
      sub: "Across completed attempts",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Violations (7d)",
      value: violationsThisWeek,
      sub: "Integrity flags this week",
      icon: ShieldAlert,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full" />)
          : stats.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{s.value}</div>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("exams")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Manage Exams</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create, edit, and organize your examinations
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("results")}
        >
          <CardHeader>
            <CardTitle className="text-lg">View All Results</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Analyze student performance across all exams
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate("live")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Live Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Watch in-progress attempts and violations in real time
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
