import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAntiCheating } from '@/hooks/use-anti-cheating';
import { QuizTimer } from './QuizTimer';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What does JSX stand for?",
    options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Xerox"],
    correctAnswer: 0,
  },
  {
    id: 2,
    text: "Which hook is used for side effects in React?",
    options: ["useState", "useMemo", "useEffect", "useCallback"],
    correctAnswer: 2,
  },
  {
    id: 3,
    text: "What is the primary benefit of TypeScript?",
    options: ["Faster execution", "Static typing", "Smaller bundle size", "Native browser support"],
    correctAnswer: 1,
  },
  {
    id: 4,
    text: "Which CSS property is used to create a flex container?",
    options: ["display: grid", "display: block", "display: flex", "position: relative"],
    correctAnswer: 2,
  },
  {
    id: 5,
    text: "What is the virtual DOM?",
    options: ["A mirror of the real DOM", "A physical hardware component", "A database engine", "A CSS preprocessor"],
    correctAnswer: 0,
  },
];

interface ExamInterfaceProps {
  examTitle: string;
  duration: number;
  onFinish: (result: { score: number; strikes: number; totalQuestions: number }) => void;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({ examTitle, duration, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  const finishExam = (currentStrikes: number) => {
    let score = 0;
    QUESTIONS.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });
    onFinish({ score, strikes: currentStrikes, totalQuestions: QUESTIONS.length });
  };

  const { strikes } = useAntiCheating({
    maxStrikes: 3,
    onExceeded: () => finishExam(3),
  });

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
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
            <QuizTimer durationMinutes={duration} onTimeUp={() => finishExam(strikes)} />
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
            <CardTitle>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</CardTitle>
            <Badge variant="secondary">Multi Choice</Badge>
          </CardHeader>
          <CardContent className="space-y-8 py-8">
            <h2 className="text-2xl font-medium">{currentQuestion.text}</h2>
            
            <RadioGroup 
              value={answers[currentQuestionIndex]?.toString()} 
              onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: parseInt(val) }))}
              className="space-y-4"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${answers[currentQuestionIndex] === idx ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value={idx.toString()} id={`q${currentQuestion.id}-o${idx}`} />
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
              {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finish Exam' : 'Next Question'}
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
