import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Student Route */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <StudentDashboard />
            </SignedIn>
          }
        />

        {/* Protected Lecturer Route */}
        <Route
          path="/lecturer"
          element={
            <SignedIn>
              <LecturerDashboard />
            </SignedIn>
          }
        />

        {/* Root Route - Smart Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch-all */}
        <Route path="*" element={<RedirectToSignIn />} />
      </Routes>
    </Router>
  );
}

// Smart Redirect Component
function RootRedirect() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.publicMetadata?.role as string) || "student";

  return role === "lecturer" ? 
    <Navigate to="/lecturer" replace /> : 
    <Navigate to="/dashboard" replace />;
}

export default App;
