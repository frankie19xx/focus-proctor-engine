import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, RefreshCw, Trophy } from 'lucide-react';

interface ResultsPageProps {
  score: number;
  strikes: number;
  totalQuestions: number;
  onBackToDashboard: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ score, strikes, totalQuestions, onBackToDashboard }) => {
  const percentage = (score / totalQuestions) * 100;
  
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Exam Completed!</CardTitle>
          <p className="text-muted-foreground">Your performance summary is ready.</p>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-6 border rounded-xl bg-card space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Your Score</span>
              <div className="text-5xl font-extrabold text-primary">
                {score}/{totalQuestions}
              </div>
              <Badge variant={percentage >= 60 ? "secondary" : "destructive"} className="text-sm">
                {percentage}% Correct
              </Badge>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-xl bg-card space-y-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase">Integrity Status</span>
              <div className={`text-5xl font-extrabold ${strikes > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                {strikes}
              </div>
              <Badge variant={strikes === 0 ? "outline" : "destructive"} className="text-sm">
                {strikes === 0 ? "Clean Record" : "Violations Detected"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detailed Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Questions Answered</span>
                </div>
                <span className="font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${strikes > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
                  <span>Security Strikes</span>
                </div>
                <span className="font-bold">{strikes}</span>
              </div>
            </div>
          </div>

          {strikes >= 3 && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium">
                Note: This exam was automatically submitted due to excessive security violations (tab switching).
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" size="lg" onClick={onBackToDashboard}>
            <RefreshCw className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            A copy of these results has been sent to your academic advisor.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
