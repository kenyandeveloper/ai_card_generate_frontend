// src/App.jsx
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useUser } from "./components/context/UserContext";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import {
  ErrorSnackbar,
  setNotificationCallback,
} from "./components/common/ErrorSnackbar";

// Teacher
import TeacherDemoAccounts from "./components/Teacher/DemoAccounts";
import TeacherAssignDecks from "./components/Teacher/AssignDecks";
import TeacherInviteDialog from "./components/Teacher/TeacherInviteDialog";

// App pages
import Homepage from "./pages/HomePage.jsx";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/SignUp";
import Dashboard from "./components/DashBoard";
import MyDecks from "./components/MyDecks/MyDecks";
import DeckView from "./components/DeckView/DeckView";
import Study from "./components/Study/Study";
import StudyMode from "./components/StudyModeComponents/StudyMode";
import BillingReturn from "./components/Billing/BillingReturn.jsx";
import ForgotPassword from "./components/Authentication/ForgotPassword.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard";
import WelcomeOnboarding from "./pages/WelcomeOnboarding.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";

// ---- Guard: only teacher/admin may pass ----
function TeacherGuard({ children }) {
  const { user, loading, hasRole } = useUser();
  if (loading) return null; // keep UI quiet while loading
  if (!user) return <Navigate to="/login" replace />;

  if (hasRole?.("teacher", "admin")) return children;

  // Not authorized → show invite CTA inside the shell
  return (
    <DashboardLayout>
      <div className="p-6 bg-surface rounded-2xl border border-border-muted">
        <h3 className="text-xl font-semibold mb-2 text-text-primary">
          Teacher access required
        </h3>
        <p className="mb-3 text-sm text-text-muted">
          Enter a teacher invite code to continue.
        </p>
        <TeacherInviteDialog cta variant="contained" />
      </div>
    </DashboardLayout>
  );
}

function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setNotificationCallback(setNotification);
    return () => setNotificationCallback(null);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const detail = event.detail;
      const text =
        detail?.message ||
        detail?.text ||
        "An unexpected error occurred. Please try again.";
      setNotification({
        text,
        severity: detail?.severity || "error",
      });
    };
    window.addEventListener("api:error", handler);
    return () => {
      window.removeEventListener("api:error", handler);
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/welcome" element={<WelcomeOnboarding />} />
          <Route path="/billing/return" element={<BillingReturn />} />

          {/* Authenticated (your existing pages) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mydecks" element={<MyDecks />} />
          <Route path="/mydecks/:deckId" element={<DeckView />} />
          <Route path="/study" element={<Study />} />
          <Route path="/study/:deckId" element={<StudyMode />} />

          {/* Teacher area (guarded) */}
          <Route
            path="/teacher"
            element={
              <TeacherGuard>
                <DashboardLayout>
                  <TeacherDemoAccounts />
                </DashboardLayout>
              </TeacherGuard>
            }
          />
          <Route
            path="/teacher/assign"
            element={
              <TeacherGuard>
                <DashboardLayout>
                  <TeacherAssignDecks />
                </DashboardLayout>
              </TeacherGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      <ErrorSnackbar
        message={notification}
        onClose={() => setNotification(null)}
      />
    </>
  );
}

export default App;
