import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NavBar from "../components/NavBar";
import MetaStrip from "../components/common/MetaStrip";
import { QuizProvider } from "../contexts/QuizContext";
import SetupForm from "../components/quiz/SetupForm";
import QuizSession from "../components/quiz/QuizSession";
import ResultsSummary from "../components/quiz/ResultsSummary";

function QuizLayout() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 md:pt-6 space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <MetaStrip
          showStreak
          showXP
          showWeeklyGoal
          showDue={false}
          ephemeral
          ephemeralMs={1200}
        />
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        <Outlet />
      </main>
    </>
  );
}

export default function QuizPage() {
  return (
    <QuizProvider>
      <Routes>
        <Route element={<QuizLayout />}>
          <Route index element={<SetupForm />} />
          <Route path=":quizId" element={<QuizSession />} />
          <Route path=":quizId/results" element={<ResultsSummary />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>
      </Routes>
    </QuizProvider>
  );
}
