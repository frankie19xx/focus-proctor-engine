import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Exam as DbExam } from '@/types/exam';

export interface ExamForStudent {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
}

export interface CompletedResultLite {
  score: number;
  strikes: number;
  total_questions: number;
  completed_at: string;
}

interface StudentStats {
  completed_exams: number;
  pending_exams: number;
  average_score: number;
}

interface DashboardProps {
  studentName?: string;
  onStartExam: (exam: ExamForStudent) => void;
  onViewResult: (exam: ExamForStudent, result: CompletedResultLite) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ studentName, onStartExam, onViewResult }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState<DbExam[]>([]);
  const [completedResults, setCompletedResults] = useState<Record<string, CompletedResultLite>>({});
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (examError) {
      toast.error("Couldn't load exams", { description: examError.message });
      setLoading(false);
      return;
    }

    setExams((examData ?? []) as DbExam[]);

    const { data: resultData } = await supabase
      .from('results')
      .select('exam_id, score, strikes, total_questions, completed_at')
      .eq('student_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: true });

    // Keep the most recent completed attempt per exam (rows are ordered
    // oldest-first above, so later entries simply overwrite earlier ones).
    const latestByExam: Record<string, CompletedResultLite> = {};
    for (const r of resultData ?? []) {
      latestByExam[r.exam_id as string] = {
        score: r.score as number,
        strikes: r.strikes as number,
        total_questions: r.total_questions as number,
        completed_at: r.completed_at as string,
      };
    }
    setCompletedResults(latestByExam);

    const { data: statsData } = await supabase.rpc('get_student_stats', {
      p_student_id: user.id,
    });
    if (statsData) setStats(statsData as unknown as StudentStats);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = exams.filter((e) => !(e.id in completedResults)).length;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back{studentName ? `, ${studentName}` : ""}. Choose an exam to begin.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-2">
            <Badge variant="secondary">
              {loading ? '…' : `${pendingCount} Exam${pendingCount === 1 ? '' : 's'} Pending`}
            </Badge>
          </Card>
          {stats && stats.completed_exams > 0 && (
            <Card className="px-4 py-2 flex items-center gap-2">
              <Badge variant="outline">Avg. Score: {stats.average_score}%</Badge>
            </Card>
          )}
        </div>
      </div>

      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <p className="text-sm"><strong>Security Notice:</strong> All exams on Exam-Guard are monitored. Switching tabs, minimizing the window, or losing focus will result in a warning strike. Three strikes will lead to automatic submission.</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No exams are available right now. Check back once your lecturer publishes one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {exams.map((exam) => {
            const result = completedResults[exam.id];
            const completed = !!result;
            const examForStudent: ExamForStudent = {
              id: exam.id,
              title: exam.title,
              description: exam.description ?? '',
              duration: exam.duration_minutes,
              questions: exam.total_questions,
            };
            return (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {completed && (
                        <Badge variant="outline" className="flex items-center gap-1 text-emerald-600 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {exam.duration_minutes} mins
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-2xl">{exam.title}</CardTitle>
                  <CardDescription className="text-base">{exam.description || 'No description provided.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> {exam.total_questions} Questions
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  {completed && (
                    <Button
                      className="flex-1"
                      size="lg"
                      variant="outline"
                      onClick={() => onViewResult(examForStudent, result)}
                    >
                      View Result
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    size="lg"
                    variant={completed ? "outline" : "default"}
                    disabled={exam.total_questions === 0}
                    onClick={() => onStartExam(examForStudent)}
                  >
                    {exam.total_questions === 0
                      ? 'No questions yet'
                      : completed
                      ? 'Retake'
                      : 'Start Examination'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
