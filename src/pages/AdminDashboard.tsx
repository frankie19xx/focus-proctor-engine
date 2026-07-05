import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Tab = "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("pending");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Couldn't load accounts", { description: error.message });
    } else {
      setProfiles((data ?? []) as Profile[]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setActingOn(id);
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    setActingOn(null);

    if (error) {
      toast.error("Couldn't update account", { description: error.message });
      return;
    }
    toast.success(status === "approved" ? "Account approved" : "Account rejected");
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin
          </h1>
          <p className="text-muted-foreground">Review and approve new student and lecturer accounts</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>New signups start pending until you approve or reject them</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No {tab} accounts.</p>
          ) : (
            <div className="space-y-3">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.full_name || p.email}</span>
                      <Badge variant={p.role === "lecturer" ? "secondary" : "outline"}>
                        {p.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                    {p.registration_number && (
                      <p className="text-xs text-muted-foreground">Reg. no: {p.registration_number}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {tab !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actingOn === p.id}
                        onClick={() => decide(p.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {tab === "approved" ? "Revoke" : "Reject"}
                      </Button>
                    )}
                    {tab !== "approved" && (
                      <Button size="sm" disabled={actingOn === p.id} onClick={() => decide(p.id, "approved")}>
                        <Check className="h-4 w-4 mr-1" />
                        {tab === "rejected" ? "Reinstate" : "Approve"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
