import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/lecturer/OverviewTab";
import { ExamsTab } from "@/components/lecturer/ExamsTab";
import { ResultsTab } from "@/components/lecturer/ResultsTab";
import { AnalyticsTab } from "@/components/lecturer/AnalyticsTab";
import { LiveMonitoringTab } from "@/components/lecturer/LiveMonitoringTab";

export default function LecturerDashboard() {
  const { profile, signOut } = useAuth();
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Manage your
            examinations and monitor student performance.
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="live">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab onNavigate={setTab} />
        </TabsContent>
        <TabsContent value="exams" className="mt-6">
          <ExamsTab />
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <ResultsTab />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="live" className="mt-6">
          <LiveMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
