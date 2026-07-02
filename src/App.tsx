import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { ExamInterface } from '@/components/ExamInterface';
import { ResultsPage } from '@/components/ResultsPage';

type View = 'landing' | 'dashboard' | 'exam' | 'results';

function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examResult, setExamResult] = useState<{ score: number; strikes: number; totalQuestions: number } | null>(null);

  const handleStart = () => setView('dashboard');
  
  const handleStartExam = (exam: any) => {
    setSelectedExam(exam);
    setView('exam');
  };

  const handleFinishExam = (result: { score: number; strikes: number; totalQuestions: number }) => {
    setExamResult(result);
    setView('results');
  };

  const handleBackToDashboard = () => {
    setSelectedExam(null);
    setExamResult(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {view === 'landing' && <LandingPage onStart={handleStart} />}
      
      {view === 'dashboard' && <Dashboard onStartExam={handleStartExam} />}
      
      {view === 'exam' && selectedExam && (
        <ExamInterface 
          examTitle={selectedExam.title} 
          duration={selectedExam.duration} 
          onFinish={handleFinishExam} 
        />
      )}
      
      {view === 'results' && examResult && (
        <ResultsPage 
          score={examResult.score} 
          strikes={examResult.strikes} 
          totalQuestions={examResult.totalQuestions} 
          onBackToDashboard={handleBackToDashboard}
        />
      )}
      
      <Toaster position="top-center" expand={true} richColors />
    </div>
  );
}

export default App;
