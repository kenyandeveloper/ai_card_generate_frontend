import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizApi } from "../utils/apiClient";
import {
  showError,
  showInfo,
  showSuccess,
} from "../components/common/ErrorSnackbar";
import { useProgress } from "./useProgress";

const INITIAL_SESSION = {
  id: null,
  deckIds: [],
  questionCount: 0,
  totalQuestions: 0,
  currentIndex: 0,
  questions: [],
  startedAt: null,
  completedAt: null,
  timerPerQuestion: null,
  timerEnabled: false,
  score: { correct: 0, incorrect: 0 },
  status: "setup",
  timeTakenSeconds: null,
  finalSummary: null,
  generationParams: null,
};

export function useQuizSession() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { isPremium, usageInfo } = useProgress();

  const [session, setSession] = useState(INITIAL_SESSION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState([]);
  const questionStartRef = useRef(performance.now());

  const timer = useTimer({
    duration: session.timerPerQuestion ?? 30,
    onExpire: () => {},
    isPaused: false,
  });

  useEffect(() => {
    questionStartRef.current = performance.now();
  }, [session.id, session.currentIndex]);

  const generateQuiz = useCallback(
    async ({ deckIds, questionCount, timerEnabled }) => {
      try {
        setLoading(true);
        setError(null);

        if (!isPremium) {
          const quizUsage = usageInfo?.quizzes;
          const limitReached =
            quizUsage &&
            typeof quizUsage.limit === "number" &&
            typeof quizUsage.used === "number" &&
            quizUsage.used >= quizUsage.limit;
          const questionCapReached =
            !isPremium && questionCount > (quizUsage?.max_questions ?? 3);

          if (limitReached || questionCapReached) {
            showError(
              "Upgrade to continue taking quizzes or reduce the question count."
            );
            return;
          }
        }

        if (!navigator.onLine) {
          showError("You're offline. Please reconnect to generate a quiz.");
          return;
        }

        const response = await quizApi.generateQuiz({
          deckIds,
          questionCount,
          timerEnabled,
        });

        const quizId =
          response?.quiz?.id ??
          response?.quiz?.quiz_id ??
          response?.quizId ??
          response?.id ??
          null;

        if (!quizId) {
          throw new Error("Quiz id missing from generateQuiz response");
        }

        const timerPerQuestion =
          response?.quiz?.time_limit_seconds != null
            ? Number(response.quiz.time_limit_seconds) || null
            : timerEnabled
            ? 30
            : null;

        const normalizedSession = {
          id: quizId,
          deckIds: Array.isArray(deckIds) ? [...deckIds] : [],
          questionCount,
          totalQuestions: response.questions.length,
          currentIndex: 0,
          questions: response.questions.map((q, index) => ({
            id: q.id,
            prompt:
              q.question ||
              q.prompt ||
              q.question_text ||
              `Question ${index + 1}`,
            questionNumber: q.question_number ?? index + 1,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correct_answer ?? null,
            feedback: null,
            userAnswer: null,
            isCorrect: null,
          })),
          startedAt: Date.now(),
          completedAt: null,
          timerPerQuestion,
          timerEnabled: Boolean(timerPerQuestion),
          score: { correct: 0, incorrect: 0 },
          status: "active",
          timeTakenSeconds: null,
          finalSummary: null,
          generationParams: {
            deckIds: Array.isArray(deckIds) ? [...deckIds] : [],
            questionCount,
            timerEnabled: Boolean(timerPerQuestion),
          },
        };

        setSession(normalizedSession);
        showSuccess("Quiz generated! Good luck!");
        navigate(`/quiz/${quizId}`);
      } catch (err) {
        const message = err?.message || "Unknown error";
        setError(message);
        showError(`Failed to generate quiz: ${message}`);
      } finally {
        setLoading(false);
      }
    },
    [isPremium, usageInfo, navigate]
  );

  const submitAnswer = useCallback(
    async (answerId, userAnswer) => {
      try {
        setIsSubmitting(true);

        const questionIndex = session.questions.findIndex(
          (q) => q.id === answerId
        );
        if (questionIndex === -1) {
          throw new Error("Question not found");
        }

        const question = session.questions[questionIndex];
        const timeSpentSeconds = Math.max(
          0,
          Math.round((performance.now() - questionStartRef.current) / 1000)
        );

        setSession((prev) => {
          const updatedQuestions = [...prev.questions];
          updatedQuestions[questionIndex] = {
            ...question,
            userAnswer,
            isCorrect: null,
          };

          return {
            ...prev,
            questions: updatedQuestions,
          };
        });

        if (!navigator.onLine) {
          setPendingAnswers((prev) => [
            ...prev,
            {
              answerId,
              userAnswer,
              timeSpentSeconds,
              timestamp: Date.now(),
            },
          ]);
          showInfo("Answer saved offline. Will sync when reconnected.");
          return {
            isCorrect: null,
            explanation: question.explanation,
            correctAnswer: question.correctAnswer,
          };
        }

        const response = await quizApi.submitAnswer(session.id, {
          answerId,
          userAnswer,
          timeSpentSeconds,
        });

        setSession((prev) => {
          const updatedQuestions = [...prev.questions];
          const nextQuestionState = {
            ...updatedQuestions[questionIndex],
            userAnswer,
            isCorrect: response?.is_correct ?? false,
            correctAnswer:
              response?.correct_answer ?? updatedQuestions[questionIndex].correctAnswer,
            feedback: response?.feedback ?? updatedQuestions[questionIndex].feedback,
          };
          updatedQuestions[questionIndex] = nextQuestionState;

          const alreadyScored = typeof question.isCorrect === "boolean";
          const correctIncrement = alreadyScored
            ? 0
            : response?.is_correct
            ? 1
            : 0;
          const incorrectIncrement = alreadyScored
            ? 0
            : response?.is_correct
            ? 0
            : 1;

          return {
            ...prev,
            questions: updatedQuestions,
            score: {
              correct: prev.score.correct + correctIncrement,
              incorrect: prev.score.incorrect + incorrectIncrement,
            },
          };
        });

        return {
          isCorrect: response?.is_correct ?? false,
          explanation:
            response?.feedback || response?.correct_answer || question.explanation,
          correctAnswer: response?.correct_answer ?? question.correctAnswer,
        };
      } catch (err) {
        const message = err?.message || "Unknown error";
        showError(`Failed to submit answer: ${message}`);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session]
  );

  const nextQuestion = useCallback(() => {
    setSession((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        return prev;
      }
      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });

    timer.reset();
    timer.start();
  }, [timer]);

  const completeQuiz = useCallback(async () => {
    try {
      setLoading(true);

      if (pendingAnswers.length > 0) {
        showError("Please wait for offline answers to sync before completing.");
        return;
      }

      if (!navigator.onLine) {
        showError("You're offline. Reconnect to complete the quiz.");
        return;
      }

      const summary = await quizApi.completeQuiz(session.id);

      setSession((prev) => {
        const totalQuestions =
          summary?.total_questions ?? prev.totalQuestions ?? prev.questions.length;
        const correctAnswers =
          summary?.correct_answers ?? prev.score.correct ?? 0;
        const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);

        const fallbackTime =
          prev.startedAt != null
            ? Math.round((Date.now() - prev.startedAt) / 1000)
            : prev.timeTakenSeconds;

        return {
          ...prev,
          status: "completed",
          score: {
            correct: correctAnswers,
            incorrect: incorrectAnswers,
          },
          totalQuestions,
          timeTakenSeconds:
            typeof summary?.time_taken === "number"
              ? summary.time_taken
              : fallbackTime,
          completedAt: Date.now(),
          finalSummary: summary ?? prev.finalSummary ?? null,
        };
      });

      timer.reset();

      showSuccess("Quiz completed!");
      navigate(`/quiz/${session.id}/results`);
    } catch (err) {
      const message = err?.message || "Unknown error";
      showError(`Failed to complete quiz: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [session.id, pendingAnswers, navigate, timer]);

  const resetQuiz = useCallback(() => {
    setSession(INITIAL_SESSION);
    setLoading(false);
    setError(null);
    setIsSubmitting(false);
    setPendingAnswers([]);
    timer.reset();
    navigate("/quiz");
  }, [navigate, timer]);

  const restoreSession = useCallback(
    async (existingQuizId) => {
      try {
        setLoading(true);
        setError(null);

        if (!navigator.onLine) {
          throw new Error("Cannot restore session while offline");
        }

        const response = await quizApi.getQuiz(existingQuizId);

        const quizPayload = response?.quiz ?? response ?? {};
        const questionsPayload = response?.questions ?? [];

        const restoredSession = {
          id: quizPayload.id ?? response.quizId ?? existingQuizId,
          deckIds: quizPayload.deck_ids || response.deckIds || [],
          questionCount:
            quizPayload.total_questions ?? questionsPayload.length ?? 0,
          totalQuestions:
            quizPayload.total_questions ?? questionsPayload.length ?? 0,
          currentIndex: response.currentIndex || 0,
          questions: questionsPayload.map((q, index) => ({
            id: q.id,
            prompt:
              q.question ||
              q.prompt ||
              q.question_text ||
              `Question ${q.question_number ?? index + 1}`,
            questionNumber: q.question_number ?? index + 1,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correct_answer ?? null,
            feedback: q.feedback ?? null,
            userAnswer: q.user_answer || null,
            isCorrect:
              typeof q.is_correct === "boolean" ? q.is_correct : null,
          })),
          startedAt: quizPayload.started_at || response.startedAt || Date.now(),
          completedAt: quizPayload.completed_at || response.completedAt || null,
          timerPerQuestion:
            quizPayload.time_limit_seconds ?? response.timerPerQuestion ?? null,
          timerEnabled: Boolean(
            quizPayload.time_limit_seconds ?? response.timerPerQuestion
          ),
          score: {
            correct: quizPayload.correct_answers ?? response.correctAnswers ?? 0,
            incorrect:
              quizPayload.total_questions != null &&
              quizPayload.correct_answers != null
                ? quizPayload.total_questions - quizPayload.correct_answers
                : response.score?.incorrect ?? 0,
          },
          status: quizPayload.status || response.status || "active",
          timeTakenSeconds: response.time_taken ?? quizPayload.time_taken ?? null,
          finalSummary: response.summary ?? null,
          generationParams: {
            deckIds: quizPayload.deck_ids || response.deckIds || [],
            questionCount:
              quizPayload.total_questions ?? questionsPayload.length ?? 0,
            timerEnabled: Boolean(
              quizPayload.time_limit_seconds ?? response.timerPerQuestion
            ),
          },
        };

        setSession(restoredSession);

        if (restoredSession.status === "completed") {
          navigate(`/quiz/${existingQuizId}/results`, { replace: true });
        }
      } catch (err) {
        const message = err?.message || "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (pendingAnswers.length === 0 || !session.id) {
      return;
    }

    const handleOnline = () => {
      const retryPendingAnswers = async () => {
        for (const pending of pendingAnswers) {
          try {
            const syncResponse = await quizApi.submitAnswer(session.id, {
              answerId: pending.answerId,
              userAnswer: pending.userAnswer,
              timeSpentSeconds: pending.timeSpentSeconds,
            });
            setSession((prev) => {
              const questionIndex = prev.questions.findIndex(
                (q) => q.id === pending.answerId
              );
              if (questionIndex === -1) {
                return prev;
              }
              const updatedQuestions = [...prev.questions];
              const questionState = updatedQuestions[questionIndex];
              const alreadyScored = typeof questionState.isCorrect === "boolean";
              const isCorrect = syncResponse?.is_correct ?? false;
              updatedQuestions[questionIndex] = {
                ...questionState,
                userAnswer: pending.userAnswer,
                isCorrect,
                correctAnswer:
                  syncResponse?.correct_answer ?? questionState.correctAnswer,
                feedback: syncResponse?.feedback ?? questionState.feedback,
              };

              return {
                ...prev,
                questions: updatedQuestions,
                score: alreadyScored
                  ? prev.score
                  : {
                      correct: prev.score.correct + (isCorrect ? 1 : 0),
                      incorrect: prev.score.incorrect + (isCorrect ? 0 : 1),
                    },
              };
            });
          } catch (err) {
            console.error("Failed to sync pending answer:", err);
            return;
          }
        }
        setPendingAnswers([]);
        showSuccess("Offline answers synced!");
      };

      retryPendingAnswers();
    };

    window.addEventListener("online", handleOnline);

    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [pendingAnswers, session.id]);

  useEffect(() => {
    if (quizId) {
      restoreSession(quizId).catch(() => {
        showInfo("Quiz session expired. Start a new quiz.");
        navigate("/quiz", { replace: true });
      });
    }
  }, [quizId, restoreSession, navigate]);

  const currentQuestion = useMemo(() => {
    if (
      !session.questions.length ||
      session.currentIndex >= session.questions.length
    ) {
      return null;
    }
    return session.questions[session.currentIndex];
  }, [session.questions, session.currentIndex]);

  const progress = useMemo(
    () => ({
      current: session.currentIndex + 1,
      total:
        session.totalQuestions ??
        session.questionCount ??
        session.questions.length ??
        0,
    }),
    [session.currentIndex, session.totalQuestions, session.questionCount, session.questions.length]
  );

  const canProceed = useMemo(() => {
    return currentQuestion?.userAnswer !== null && !isSubmitting;
  }, [currentQuestion, isSubmitting]);

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      isSubmitting,
      timer,
      pendingAnswers,
      currentQuestion,
      progress,
      canProceed,
      generateQuiz,
      submitAnswer,
      nextQuestion,
      completeQuiz,
      resetQuiz,
    }),
    [
      session,
      loading,
      error,
      isSubmitting,
      timer,
      pendingAnswers,
      currentQuestion,
      progress,
      canProceed,
      generateQuiz,
      submitAnswer,
      nextQuestion,
      completeQuiz,
      resetQuiz,
    ]
  );

  return value;
}

export function useTimer({
  duration = 30,
  onExpire = () => {},
  isPaused = false,
} = {}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(null);

  const tick = useCallback(
    (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = Math.floor((timestamp - startTimeRef.current) / 1000);
      const remaining = Math.max(duration - elapsed, 0);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        onExpire();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [duration, onExpire]
  );

  const start = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      pausedAtRef.current = performance.now();
    }
  }, []);

  const resume = useCallback(() => {
    if (pausedAtRef.current) {
      const pauseDuration = performance.now() - pausedAtRef.current;
      startTimeRef.current += pauseDuration;
      pausedAtRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startTimeRef.current = null;
    pausedAtRef.current = null;
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (rafRef.current === null) {
      setTimeRemaining(duration);
    }
  }, [duration]);

  useEffect(() => {
    if (isPaused) {
      pause();
    } else if (startTimeRef.current !== null) {
      resume();
    }
  }, [isPaused, pause, resume]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return {
    timeRemaining,
    start,
    pause,
    resume,
    reset,
  };
}
