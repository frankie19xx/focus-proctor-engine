import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { isValidEmail } from "@/lib/validators";

type Role = "student" | "lecturer";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError || "Couldn't sign you in. Check your email and password.");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Choose your role and sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : `Log in as ${role === "student" ? "Student" : "Lecturer"}`}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-sm text-center">
            <Link to="/forgot-password" className="block text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Forgot your password?
            </Link>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4 hover:text-foreground">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
