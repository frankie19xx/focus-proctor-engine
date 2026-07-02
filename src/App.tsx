import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import Login from "./pages/Login";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with Clerk or Supabase auth check
    const storedRole = localStorage.getItem("userRole"); // or get from Clerk metadata
    setUserRole(storedRole);
    setLoading(false);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === "lecturer" ? "/lecturer" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root Route - Smart Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Smart Redirect Component
function RootRedirect() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Replace with real auth later
    setUserRole(role);
  }, []);

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  return userRole === "lecturer" ? 
    <Navigate to="/lecturer" replace /> : 
    <Navigate to="/dashboard" replace />;
}

export default App;
