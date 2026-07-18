import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAntiCheating } from '@/hooks/use-anti-cheating';
import { QuizTimer } from './QuizTimer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Question, ResultStatus } from '@/types/exam';
import { toast } from 'sonner';

interface ExamInterfaceProps {
  examId: string;
  examTitle: string;
  duration: number;
  onFinish: (result: { score: number; strikes: number; totalQuestions: number }) => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId, examTitle, duration, onFinish }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const resultIdRef = useRef<string | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const answersRef = useRef<Record<number, string>>({});

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load questions and open an in-progress result row to track this attempt.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_number', { ascending: true });

      if (questionError || !questionData || questionData.length === 0) {
        toast.error("Couldn't load exam questions", { description: questionError?.message });
        setLoading(false);
        return;
      }

      const { data: resultRow, error: resultError } = await supabase
        .from('results')
        .insert({
          student_id: user.id,
          exam_id: examId,
          total_questions: questionData.length,
          status: 'in_progress' as ResultStatus,
        })
        .select('id')
        .single();

      if (resultError || !resultRow) {
        toast.error("Couldn't start the exam", { description: resultError?.message });
        setLoading(false);
        return;
      }

      if (cancelled) return;
      resultIdRef.current = resultRow.id as string;
      setQuestions(questionData as Question[]);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [examId, user]);

  const finishExam = async (currentStrikes: number, status: ResultStatus = 'completed') => {
    if (finished) return;
    setFinished(true);

    const qs = questionsRef.current;
    const finalAnswers = answersRef.current;
    let score = 0;
    qs.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correct_answer) score++;
    });

    if (resultIdRef.current) {
      const { error } = await supabase
        .from('results')
        .update({
          score,
          strikes: currentStrikes,
          status,
          completed_at: new Date().toISOString(),
        })
        .eq('id', resultIdRef.current);

      if (error) {
        toast.error("Couldn't save your result", { description: error.message });
      }
    }

    onFinish({ score, strikes: currentStrikes, totalQuestions: qs.length });
  };

  const { strikes } = useAntiCheating({
    maxStrikes: 3,
    enabled: !loading && !finished,
    onExceeded: () => finishExam(3, 'auto_submitted'),
    onLogViolation: (type, strikeNumber) => {
      if (!resultIdRef.current || !user) return;
      supabase.from('cheating_logs').insert({
        result_id: resultIdRef.current,
        student_id: user.id,
        violation_type: type,
        violation_number: strikeNumber,
      }).then(({ error }) => {
        if (error) console.error('Failed to log violation', error);
      });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading exam…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        This exam has no questions yet.
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishExam(strikes);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{examTitle}</h1>
            <p className="text-sm text-muted-foreground">In Progress - Do not leave this tab</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center border-x px-6">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Time Remaining</span>
            <QuizTimer durationMinutes={duration} onTimeUp={() => finishExam(strikes, 'auto_submitted')} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Strikes</span>
            <div className={`text-xl font-bold ${strikes > 0 ? 'text-destructive' : 'text-primary'}`}>
              {strikes}/3
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl">
        <Card className="shadow-lg border-2">
          <div className="h-1 w-full bg-muted">
            <Progress value={progress} className="h-1 rounded-none" />
          </div>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            <Badge variant="secondary">Multi Choice</Badge>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <h2 className="text-2xl font-medium">{currentQuestion.question_text}</h2>

            <RadioGroup
              value={answers[currentQuestionIndex] ?? ''}
              onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }))}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${answers[currentQuestionIndex] === option ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value={option} id={`q${currentQuestion.id}-o${idx}`} />
                  <Label htmlFor={`q${currentQuestion.id}-o${idx}`} className="flex-1 cursor-pointer text-lg">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <div className="p-6 border-t flex justify-between bg-muted/20">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button size="lg" onClick={handleNext}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
            </Button>
          </div>
        </Card>

        {strikes > 0 && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg animate-pulse">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-medium text-sm md:text-base">
              Warning: Integrity violation detected! Leaving the exam tab will result in automatic submission.
              Strikes: {strikes}/3
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
