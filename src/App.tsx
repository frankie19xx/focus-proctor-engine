import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

// Import your pages
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root URL automatically redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <StudentDashboard />
            </SignedIn>
          }
        />

        {/* Lecturer Dashboard */}
        <Route
          path="/lecturer"
          element={
            <SignedIn>
              <LecturerDashboard />
            </SignedIn>
          }
        />

        {/* Catch all unauthorized users */}
        <Route path="*" element={<RedirectToSignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
