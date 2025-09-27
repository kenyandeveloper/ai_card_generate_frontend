import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "./components/ThemeComponents/ThemeProvider";
import { darkTheme } from "./theme";
import Homepage from "./pages/HomePage.jsx";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/SignUp";
import Dashboard from "./components/DashBoard";
import MyDecks from "./components/MyDecks/MyDecks";
import DeckView from "./components/DeckView/DeckView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Study from "./components/Study/Study";
import StudyMode from "./components/StudyModeComponents/StudyMode";
import BillingReturn from "./components/Billing/BillingReturn.jsx";
import ForgotPassword from "./components/Authentication/ForgotPassword.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard";
import WelcomeOnboarding from "./pages/WelcomeOnboarding.jsx";

function AppContent() {
  return (
    <MUIThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/welcome" element={<WelcomeOnboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mydecks" element={<MyDecks />} />
          <Route path="/mydecks/:deckId" element={<DeckView />} />
          <Route path="/study" element={<Study />} />
          <Route path="/study/:deckId" element={<StudyMode />} />
          <Route path="/billing/return" element={<BillingReturn />} />
        </Routes>
      </Router>
    </MUIThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
