import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Result } from "@/types/exam";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileLite {
  id: string;
  full_name: string | null;
  email: string;
}

const statusVariant: Record<Result["status"], "default" | "secondary" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  auto_submitted: "destructive",
};

export function ResultsTab() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [examFilter, setExamFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("created_by", user.id);

    if (examError) {
      toast.error("Couldn't load exams", { description: examError.message });
      setLoading(false);
      return;
    }

    const myExams = (examData ?? []) as Exam[];
    setExams(myExams);

    if (myExams.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const examIds = myExams.map((e) => e.id);
    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .select("*")
      .in("exam_id", examIds)
      .order("created_at", { ascending: false });

    if (resultError) {
      toast.error("Couldn't load results", { description: resultError.message });
      setLoading(false);
      return;
    }

    const allResults = (resultData ?? []) as Result[];
    setResults(allResults);

    const studentIds = [...new Set(allResults.map((r) => r.student_id))];
    if (studentIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", studentIds);

      if (!profileError && profileData) {
        const map: Record<string, ProfileLite> = {};
        for (const p of profileData as ProfileLite[]) map[p.id] = p;
        setProfiles(map);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const examTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of exams) map[e.id] = e.title;
    return map;
  }, [exams]);

  const filteredResults = useMemo(() => {
    if (examFilter === "all") return results;
    return results.filter((r) => r.exam_id === examFilter);
  }, [results, examFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">Student Results</h2>
          <p className="text-sm text-muted-foreground">
            Every submission across your examinations
          </p>
        </div>
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All exams</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filteredResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No results yet{examFilter !== "all" ? " for this exam" : ""}.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Strikes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((r) => {
                  const profile = profiles[r.student_id];
                  const pct =
                    r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{profile?.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{profile?.email}</div>
                      </TableCell>
                      <TableCell>{examTitleById[r.exam_id] ?? "—"}</TableCell>
                      <TableCell>
                        {r.status === "in_progress" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span>
                            {r.score}/{r.total_questions}{" "}
                            <span className="text-xs text-muted-foreground">({pct}%)</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={r.strikes > 0 ? "text-orange-600 font-medium" : ""}>
                          {r.strikes}/3
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[r.status]}>
                          {r.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.completed_at ? new Date(r.completed_at).toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
