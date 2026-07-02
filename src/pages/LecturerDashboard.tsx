import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, Award, Clock, TrendingUp } from "lucide-react";

export default function LecturerDashboard() {
  const [exams] = useState([
    {
      id: 1,
      title: "Advanced Web Development",
      questions: 10,
      duration: 30,
      students: 87,
      status: "active",
      avgScore: 78,
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      questions: 15,
      duration: 45,
      students: 64,
      status: "scheduled",
      avgScore: 82,
    },
    {
      id: 3,
      title: "Database Systems",
      questions: 12,
      duration: 40,
      students: 52,
      status: "completed",
      avgScore: 75,
    },
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">Manage your examinations and monitor student performance</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Create New Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 active this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students Monitored</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">203</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">77%</div>
            <p className="text-xs text-muted-foreground">+3% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cheating Attempts</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">7</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Active & Recent Exams */}
      <Card>
        <CardHeader>
          <CardTitle>Your Examinations</CardTitle>
          <CardDescription>Manage ongoing and upcoming exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    📝
                  </div>
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exam.questions} questions • {exam.duration} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium">{exam.students} students</div>
                    <div className="text-xs text-muted-foreground">Avg: {exam.avgScore}%</div>
                  </div>

                  <Badge
                    variant={exam.status === "active" ? "default" : exam.status === "scheduled" ? "secondary" : "outline"}
                  >
                    {exam.status.toUpperCase()}
                  </Badge>

                  <Button variant="outline" size="sm">
                    View Results
                  </Button>
                  <Button size="sm">
                    {exam.status === "active" ? "Monitor Live" : "Edit Exam"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Create New Exam</CardTitle>
            <CardDescription>Build a new examination with anti-cheating features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Create Exam</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">View All Results</CardTitle>
            <CardDescription>Analyze student performance across all exams</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Reports</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Security Logs</CardTitle>
            <CardDescription>Review cheating attempts and violations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
