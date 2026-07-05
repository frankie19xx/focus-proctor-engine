import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
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
import { isEduEmail, isValidRegistrationNumber, isValidEmail } from "@/lib/validators";

type Role = "student" | "lecturer";
type Step = "form" | "verify";

export default function Signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
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
    if (role === "lecturer" && !isEduEmail(email)) {
      return "Lecturer accounts must be created with an email ending in \".edu\".";
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

    if (!isLoaded) return;

    setSubmitting(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata:
          role === "student"
            ? { role, registrationNumber: registrationNumber.trim() }
            : { role },
      });

      if (result.status === "complete") {
        // Email verification is off for this Clerk instance — account is
        // ready immediately, no code needed.
        await setActive({ session: result.createdSessionId });
        navigate("/", { replace: true });
        return;
      }

      // Verification is required (this is the expected path when "Verify
      // at sign-up" is turned on in the Clerk Dashboard). Re-assert
      // metadata before sending the code, then send it.
      await signUp.update({
        unsafeMetadata:
          role === "student"
            ? { role, registrationNumber: registrationNumber.trim() }
            : { role },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      const clerkMessage =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message;
      setError(clerkMessage || "Something went wrong creating your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoaded) return;
    if (!code.trim()) {
      setError("Enter the code we emailed you.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (result.status !== "complete") {
        setError("That code didn't work. Double-check it and try again.");
        return;
      }

      await setActive({ session: result.createdSessionId });
      navigate("/", { replace: true });
    } catch (err) {
      const clerkMessage =
        (err as { errors?: { message?: string }[] })?.errors?.[0]?.message;
      setError(clerkMessage || "That code didn't work. Double-check it and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setError("A new code was sent to your email.");
    } catch {
      setError("Couldn't resend the code. Please try again in a moment.");
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification code to <span className="font-medium">{email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <Alert variant={error.startsWith("A new code") ? "default" : "destructive"}>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
                {submitting ? "Verifying..." : "Verify and continue"}
              </Button>

              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground w-full text-center"
              >
                Resend code
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <Label htmlFor="lecturer-email">Institutional Email</Label>
                  <Input
                    id="lecturer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must end in ".edu" — personal or generic emails aren't accepted.
                  </p>
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Clerk requires this element to exist for bot protection (CAPTCHA) */}
              <div id="clerk-captcha" />

              <Button type="submit" className="w-full" disabled={submitting || !isLoaded}>
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
