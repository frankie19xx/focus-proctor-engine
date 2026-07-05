import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock, XCircle, Mail } from "lucide-react";

interface LocationState {
  needsEmailConfirmation?: boolean;
  email?: string;
}

export default function AwaitingApproval() {
  const { profile, signOut, refreshProfile } = useAuth();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;
  const [checking, setChecking] = useState(false);

  // Edge case: Supabase email confirmation is enabled on this project, so
  // signUp didn't return a session. Nothing to check server-side yet —
  // the person needs to click the link in their inbox first.
  if (state?.needsEmailConfirmation) {
    return (
      <Holding
        icon={<Mail className="h-10 w-10 text-primary" />}
        title="Confirm your email"
        description={`We sent a confirmation link to ${state.email ?? "your email address"}. Click it, then log in — your account will be waiting for admin approval after that.`}
      />
    );
  }

  if (!profile) {
    return (
      <Holding
        icon={<Clock className="h-10 w-10 text-muted-foreground" />}
        title="Loading your account..."
        description="One moment."
      />
    );
  }

  const handleCheckAgain = async () => {
    setChecking(true);
    await refreshProfile();
    setChecking(false);
  };

  if (profile.status === "rejected") {
    return (
      <Holding
        icon={<XCircle className="h-10 w-10 text-destructive" />}
        title="Account not approved"
        description="An admin reviewed your signup and didn't approve it. If you think this is a mistake, reach out to your administrator."
        onSignOut={signOut}
      />
    );
  }

  return (
    <Holding
      icon={<Clock className="h-10 w-10 text-primary" />}
      title="Awaiting approval"
      description={`Your ${profile.role} account is created and waiting for an admin to approve it. You'll be able to sign in as usual once that happens.`}
      onCheckAgain={handleCheckAgain}
      checking={checking}
      onSignOut={signOut}
    />
  );
}

function Holding({
  icon,
  title,
  description,
  onCheckAgain,
  checking,
  onSignOut,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onCheckAgain?: () => void;
  checking?: boolean;
  onSignOut?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {(onCheckAgain || onSignOut) && (
          <CardContent className="flex flex-col gap-2">
            {onCheckAgain && (
              <Button onClick={onCheckAgain} disabled={checking}>
                {checking ? "Checking..." : "Check again"}
              </Button>
            )}
            {onSignOut && (
              <Button variant="outline" onClick={onSignOut}>
                Sign out
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
