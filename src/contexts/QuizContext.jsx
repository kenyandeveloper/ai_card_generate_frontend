import { createContext, useContext } from "react";
import { useQuizSession } from "../hooks/useQuizSession";

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const quiz = useQuizSession();

  return (
    <QuizContext.Provider value={quiz}>{children}</QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error("useQuiz must be used within QuizProvider");
  }

  return context;
}

