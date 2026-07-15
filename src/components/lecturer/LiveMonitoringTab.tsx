import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Exam, Result, CheatingLog } from "@/types/exam";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle, ShieldAlert, Timer } from "lucide-react";
import { toast } from "sonner";

interface ProfileLite {
  id: string;
  full_name: string | null;
  email: string;
}


function formatElapsed(startedAt: string): string {
  const started = new Date(startedAt).getTime();
  const diffMs = Date.now() - started;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function LiveMonitoringTab() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Result[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [recentViolations, setRecentViolations] = useState<CheatingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [, forceTick] = useState(0);
  const examIdsRef = useRef<string[]>([]);

  const fetchProfilesFor = useCallback(async (ids: string[]) => {
    const missing = ids.filter((id) => !(id in profiles));
    if (missing.length === 0) return;
    const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", missing);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        for (const p of data as ProfileLite[]) next[p.id] = p;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("created_by", user.id);

    if (examError) {
      toast.error("Couldn't load live monitoring", { description: examError.message });
      setLoading(false);
      return;
    }

    const myExams = (examData ?? []) as Exam[];
    setExams(myExams);
    examIdsRef.current = myExams.map((e) => e.id);

    if (myExams.length === 0) {
      setAttempts([]);
      setLoading(false);
      return;
    }

    const { data: resultData, error: resultError } = await supabase
      .from("results")
      .select("*")
      .in("exam_id", examIdsRef.current)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false });

    if (resultError) {
      toast.error("Couldn't load in-progress attempts", { description: resultError.message });
      setLoading(false);
      return;
    }

    const inProgress = (resultData ?? []) as Result[];
    setAttempts(inProgress);
    await fetchProfilesFor(inProgress.map((r) => r.student_id));

    const resultIds = inProgress.map((r) => r.id);
    if (resultIds.length > 0) {
      const { data: logData } = await supabase
        .from("cheating_logs")
        .select("*")
        .in("result_id", resultIds)
        .order("created_at", { ascending: false })
        .limit(20);
      setRecentViolations((logData ?? []) as CheatingLog[]);
    } else {
      setRecentViolations([]);
    }

    setLoading(false);
  }, [user, fetchProfilesFor]);

  useEffect(() => {
    load();
  }, [load]);

  // Tick every second so elapsed-time labels stay live.
  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Realtime: reflect new attempts starting/finishing and new violations
  // as they happen, without a manual refresh.
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("lecturer-live-monitoring")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "results" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Result | undefined;
          if (!row || !examIdsRef.current.includes(row.exam_id)) return;

          if (payload.eventType === "DELETE") {
            setAttempts((prev) => prev.filter((a) => a.id !== row.id));
            return;
          }

          const updated = payload.new as Result;
          if (updated.status === "in_progress") {
            setAttempts((prev) => {
              const exists = prev.some((a) => a.id === updated.id);
              return exists
                ? prev.map((a) => (a.id === updated.id ? updated : a))
                : [updated, ...prev];
            });
            fetchProfilesFor([updated.student_id]);
          } else {
            // Finished (completed / auto-submitted) — drop from the live list.
            setAttempts((prev) => prev.filter((a) => a.id !== updated.id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cheating_logs" },
        (payload) => {
          const row = payload.new as CheatingLog;
          setRecentViolations((prev) => [row, ...prev].slice(0, 20));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProfilesFor]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
          Live Monitoring
        </h2>
        <p className="text-sm text-muted-foreground">
          Attempts currently in progress across your exams, updating in real time
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>In-Progress Attempts ({attempts.length})</CardTitle>
          <CardDescription>Students actively taking one of your exams right now</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No one is currently taking an exam.
            </p>
          ) : (
            <div className="space-y-3">
              {attempts.map((a) => {
                const exam = exams.find((e) => e.id === a.exam_id);
                const profile = profiles[a.student_id];
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {profile?.full_name || profile?.email || "Student"}
                        {a.strikes > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <ShieldAlert className="w-3 h-3 mr-1" /> {a.strikes}/3 strikes
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{exam?.title ?? "Unknown exam"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="w-4 h-4" />
                      {formatElapsed(a.started_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>Live feed of integrity flags from active attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {recentViolations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No violations from active attempts yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentViolations.map((v) => {
                const attempt = attempts.find((a) => a.id === v.result_id);
                const profile = profiles[v.student_id];
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-sm p-3 border rounded-md bg-orange-50/50 dark:bg-orange-950/10"
                  >
                    <span>
                      <strong>{profile?.full_name || profile?.email || "Student"}</strong>{" "}
                      — {v.violation_type.replace("_", " ")}
                      {attempt ? "" : " (attempt no longer active)"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
