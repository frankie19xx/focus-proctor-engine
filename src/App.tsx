import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import type { ReactElement } from "react";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

type Role = "student" | "lecturer";

function useRole(): Role | undefined {
  const { user } = useUser();
  return user?.unsafeMetadata?.role as Role | undefined;
}

/** Sends a signed-in user to whichever dashboard matches their stored role. */
function RoleRedirect() {
  const role = useRole();

  if (role === "lecturer") return <Navigate to="/lecturer" replace />;
  if (role === "student") return <Navigate to="/dashboard" replace />;

  // Signed in but no role set (shouldn't normally happen via our signup flow)
  return <Navigate to="/login" replace />;
}

/** Only renders children if the signed-in user's role matches; otherwise redirects. */
function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const actualRole = useRole();

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

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
