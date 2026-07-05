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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { isValidRegistrationNumber, isValidEmail } from "@/lib/validators";

type Role = "student" | "lecturer";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetFieldsOnRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    setError(null);
  };

  const validate = (): string | null => {
    if (!isValidEmail(email)) {
      return "Please enter a valid email address.";
    }
    if (role === "student" && !isValidRegistrationNumber(registrationNumber)) {
      return "Registration number must contain both letters and numbers (e.g. CS/2021/034).";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp(email, password, {
      role,
      registrationNumber: role === "student" ? registrationNumber.trim() : undefined,
    });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    if (needsEmailConfirmation) {
      navigate("/awaiting-approval", { replace: true, state: { needsEmailConfirmation: true, email } });
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Choose your role to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => resetFieldsOnRoleChange(v as Role)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
            </TabsList>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <TabsContent value="student" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-number">Registration Number</Label>
                  <Input
                    id="reg-number"
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. CS/2021/034"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must include both letters and numbers.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="lecturer" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="lecturer-email">Email</Label>
                  <Input
                    id="lecturer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : `Sign up as ${role === "student" ? "Student" : "Lecturer"}`}
              </Button>
            </form>
          </Tabs>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
