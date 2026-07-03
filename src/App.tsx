import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Pages
import Home from "./pages/Home";                    // Your original home page
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <StudentDashboard />
            </SignedIn>
          }
        />

        {/* Protected Lecturer Dashboard */}
        <Route
          path="/lecturer"
          element={
            <SignedIn>
              <LecturerDashboard />
            </SignedIn>
          }
        />

        {/* Smart Root Redirect after Login */}
        <Route path="/redirect" element={<RoleBasedRedirect />} />

        {/* Catch all unauthorized access */}
        <Route path="*" element={<RedirectToSignIn />} />
      </Routes>
    </Router>
  );
}

// Role-Based Redirect after Login
function RoleBasedRedirect() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // Get role from Clerk metadata (you can set this in Clerk dashboard)
  const role = (user?.publicMetadata?.role as string) || "student";

  return role === "lecturer" ? 
    <Navigate to="/lecturer" replace /> : 
    <Navigate to="/dashboard" replace />;
}

export default App;
