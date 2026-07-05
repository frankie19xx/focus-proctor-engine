import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useClerk } from "@clerk/clerk-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

type Role = "student" | "lecturer";

function useRole(): { role: Role | undefined; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  return { role: user?.unsafeMetadata?.role as Role | undefined, isLoaded };
}

/** Sends a signed-in user to whichever dashboard matches their stored role. */
function RoleRedirect() {
  const { role, isLoaded } = useRole();
  const { signOut } = useClerk();

  // Clerk is still fetching the user record — don't decide anything yet,
  // or we risk redirecting based on a momentarily-empty role.
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (role === "lecturer") return <Navigate to="/lecturer" replace />;
  if (role === "student") return <Navigate to="/dashboard" replace />;

  // Signed in but genuinely has no role set (e.g. an old test account from
  // before roles existed). Don't redirect to /login — that route also
  // renders this component for signed-in users, which would loop. Give the
  // person a way out instead.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-muted-foreground max-w-sm">
        This account doesn't have a role assigned. Sign out and create a new
        account as a Student or Lecturer.
      </p>
      <Button variant="outline" onClick={() => signOut({ redirectUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}

/** Only renders children if the signed-in user's role matches; otherwise redirects. */
function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const { role: actualRole, isLoaded } = useRole();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (actualRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={
          <>
            <SignedIn>
              <RoleRedirect />
            </SignedIn>
            <SignedOut>
              <Home />
            </SignedOut>
          </>
        } />

        {/* Auth pages: redirect away if already signed in, since Clerk
            throws "Session already exists" if you try to sign in/up again */}
        <Route
          path="/login"
          element={
            <>
              <SignedIn>
                <RoleRedirect />
              </SignedIn>
              <SignedOut>
                <Login />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <SignedIn>
                <RoleRedirect />
              </SignedIn>
              <SignedOut>
                <Signup />
              </SignedOut>
            </>
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <RequireRole role="student">
                  <StudentDashboard />
                </RequireRole>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Lecturer Dashboard */}
        <Route
          path="/lecturer"
          element={
            <>
              <SignedIn>
                <RequireRole role="lecturer">
                  <LecturerDashboard />
                </RequireRole>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* Catch all unauthorized users */}
        <Route path="*" element={<RedirectToSignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
