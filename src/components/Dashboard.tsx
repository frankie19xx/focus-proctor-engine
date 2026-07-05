import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, FileText, ShieldAlert } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
}

const MOCK_EXAMS: Exam[] = [
  {
    id: '1',
    title: 'Advanced Web Development',
    description: 'A comprehensive test on React, TypeScript, and modern CSS frameworks.',
    duration: 30,
    questions: 10,
  },
  {
    id: '2',
    title: 'Data Structures & Algorithms',
    description: 'Evaluate your knowledge on fundamental algorithms and complex data structures.',
    duration: 45,
    questions: 15,
  },
];

interface DashboardProps {
  studentName?: string;
  onStartExam: (exam: Exam) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ studentName, onStartExam }) => {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back{studentName ? `, ${studentName}` : ""}. Choose an exam to begin.</p>
        </div>
        <div className="hidden md:flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-2">
            <Badge variant="secondary">2 Exams Pending</Badge>
          </Card>
        </div>
      </div>

      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <p className="text-sm"><strong>Security Notice:</strong> All exams on Exam-Guard are monitored. Switching tabs, minimizing the window, or losing focus will result in a warning strike. Three strikes will lead to automatic submission.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {MOCK_EXAMS.map((exam) => (
          <Card key={exam.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {exam.duration} mins
                </Badge>
              </div>
              <CardTitle className="mt-4 text-2xl">{exam.title}</CardTitle>
              <CardDescription className="text-base">{exam.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> {exam.questions} Questions
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button className="w-full" size="lg" onClick={() => onStartExam(exam)}>
                Start Examination
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
