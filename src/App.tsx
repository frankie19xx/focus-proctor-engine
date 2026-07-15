import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types/profile";
import { Toaster } from "@/components/ui/sonner";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AwaitingApproval from "./pages/AwaitingApproval";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Loading...
    </div>
  );
}

/** Where a signed-in, approved user belongs. */
function homeRouteFor(role: Role): string {
  if (role === "lecturer") return "/lecturer";
  if (role === "admin") return "/admin";
  return "/dashboard";
}

/**
 * Sends a signed-in user wherever they belong right now:
 * - no profile row yet (trigger hasn't caught up) -> wait
 * - pending/rejected -> /awaiting-approval
 * - approved -> their role's dashboard
 */
function RoleRedirect() {
  const { profile } = useAuth();

  if (!profile) return <LoadingScreen />;
  if (profile.status !== "approved") return <Navigate to="/awaiting-approval" replace />;
  return <Navigate to={homeRouteFor(profile.role)} replace />;
}

/** Only renders children for an approved user with a matching role. */
function RequireRole({ role, children }: { role: Role; children: ReactElement }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <LoadingScreen />;
  if (profile.status !== "approved") return <Navigate to="/awaiting-approval" replace />;
  if (profile.role !== role) return <Navigate to={homeRouteFor(profile.role)} replace />;
  return children;
}

/** The pending/rejected holding page. Approved users get bounced onward. */
function RequireUnapproved({ children }: { children: ReactElement }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <LoadingScreen />;
  if (profile.status === "approved") return <Navigate to={homeRouteFor(profile.role)} replace />;
  return children;
}

/** Only the tail end of a password-recovery email link should render this. */
function RequireRecoverySession({ children }: { children: ReactElement }) {
  const { loading, isPasswordRecovery } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isPasswordRecovery) return <Navigate to="/login" replace />;
  return children;
}

/** While a recovery session is active, keep the user on /reset-password no
 * matter what URL they land on or click toward — this is the fix for the
 * old bug where a recovery link fell through to the normal dashboard
 * redirect instead of prompting for a new password. */
function RecoveryGate({ children }: { children: ReactElement }) {
  const { isPasswordRecovery } = useAuth();
  const location = useLocation();

  if (isPasswordRecovery && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }
  return children;
}
/** Public pages (/, /login, /signup): signed-out users see them as-is,
 * signed-in users get redirected to wherever they belong. */
function PublicOnly({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <RoleRedirect />;
  return children;
}

function App() {
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <RecoveryGate>
        <Routes>
          <Route path="/" element={<PublicOnly><Home /></PublicOnly>} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />

          <Route
            path="/reset-password"
            element={
              <RequireRecoverySession>
                <ResetPassword />
              </RequireRecoverySession>
            }
          />

          <Route
            path="/awaiting-approval"
            element={
              <RequireUnapproved>
                <AwaitingApproval />
              </RequireUnapproved>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireRole role="student">
                <StudentDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/lecturer"
            element={
              <RequireRole role="lecturer">
                <LecturerDashboard />
              </RequireRole>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RecoveryGate>
    </Router>
  );
}

export default App;
