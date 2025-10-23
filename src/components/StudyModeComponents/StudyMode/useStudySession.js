"use client";

import { useState, useEffect, useCallback } from "react";
import { deckApi } from "../../../utils/apiClient";
import { handleApiError } from "../../../services/errorHandler";
import { useProgress } from "../../../hooks/useProgress";
import { showError, showSuccess } from "../../common/ErrorSnackbar";

export const useStudySession = (deckId, startTimeRef, sessionStartTimeRef) => {
  const [flashcards, setFlashcards] = useState([]);
  const [progress, setProgress] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionStats, setSessionStats] = useState({
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0,
    cardsLearned: 0,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [deck, setDeck] = useState(null);
  const [answeredCards, setAnsweredCards] = useState(new Set());
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const {
    deckProgress,
    fetchProgressForDeck,
    logReview,
    loading: progressLoading,
  } = useProgress(deckId, true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deckData = await deckApi.get(deckId);
        setDeck(deckData);

        const flashcardsData = await deckApi.listFlashcards({
          deck_id: deckId,
          all: true,
        });

        // Use items if paginated response, otherwise use direct array
        const deckFlashcards = Array.isArray(flashcardsData?.items)
          ? flashcardsData.items
          : Array.isArray(flashcardsData)
          ? flashcardsData
          : [];

        setFlashcards(deckFlashcards);
        const progressData = await fetchProgressForDeck(deckId);
        setProgress(Array.isArray(progressData) ? progressData : []);

        setSessionStats((prev) => ({
          ...prev,
          totalCards: deckFlashcards.length,
        }));
        setCardStartTime(Date.now());
        setAccumulatedTime(0);
        setIsPaused(false);
        if (startTimeRef) {
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        const apiError = handleApiError(err);
        setError(apiError.message || "Failed to load study session. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deckId, fetchProgressForDeck, startTimeRef]);

  useEffect(() => {
    if (Array.isArray(deckProgress)) {
      setProgress(deckProgress);
    }
  }, [deckProgress]);

  const startTimingForCard = useCallback(() => {
    if (!flashcards.length || showSummary) return;
    const now = Date.now();
    setCardStartTime(now);
    setAccumulatedTime(0);
    setIsPaused(false);
    if (startTimeRef) {
      startTimeRef.current = now;
    }
  }, [flashcards.length, showSummary, startTimeRef]);

  useEffect(() => {
    startTimingForCard();
  }, [currentFlashcardIndex, startTimingForCard]);

  const getCardProgress = useCallback(
    (flashcardId) => {
      return (
        progress.find((p) => p.flashcard_id === flashcardId) || {
          study_count: 0,
          correct_attempts: 0,
          incorrect_attempts: 0,
          is_learned: false,
        }
      );
    },
    [progress]
  );

  const getElapsedSeconds = useCallback(() => {
    if (!cardStartTime && accumulatedTime === 0) {
      return 1;
    }
    const activeMs = cardStartTime && !isPaused ? Date.now() - cardStartTime : 0;
    const elapsed = Math.round((accumulatedTime + (activeMs || 0)) / 1000);
    return Math.min(Math.max(elapsed || 1, 1), 300);
  }, [cardStartTime, accumulatedTime, isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (cardStartTime && !isPaused) {
          setAccumulatedTime((prev) => prev + (Date.now() - cardStartTime));
          setIsPaused(true);
        }
      } else if (isPaused) {
        setCardStartTime(Date.now());
        setIsPaused(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cardStartTime, isPaused]);

  const handleFinishSession = useCallback(() => {
    const totalTimeSpent = (Date.now() - sessionStartTimeRef.current) / 60000;
    setSessionStats((prev) => ({
      ...prev,
      timeSpent: Math.max(prev.timeSpent, totalTimeSpent),
    }));
    setShowSummary(true);
    setIsPaused(true);
  }, [sessionStartTimeRef]);

  const showNextCard = useCallback(() => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      handleFinishSession();
    }
  }, [currentFlashcardIndex, flashcards.length, handleFinishSession]);

  const handleAnswer = useCallback(
    async (wasCorrect) => {
      if (submittingReview) return;
      const currentFlashcard = flashcards[currentFlashcardIndex];
      if (!currentFlashcard) { 
        console.error("No current flashcard found");
        return;
      }
      const deckIdValue = Number.parseInt(deckId, 10);
      const timeSpentSeconds = getElapsedSeconds();
      const timeSpentMinutes = timeSpentSeconds / 60;

      try {
        setSubmittingReview(true);
        await logReview(
          deckIdValue,
          currentFlashcard.id,
          wasCorrect,
          timeSpentSeconds
        );

        // Track answered card
        setAnsweredCards((prev) => new Set(prev).add(currentFlashcard.id));

        setSessionStats((prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + (wasCorrect ? 1 : 0),
          incorrectAnswers: prev.incorrectAnswers + (wasCorrect ? 0 : 1),
          timeSpent: prev.timeSpent + timeSpentMinutes,
        }));
        showSuccess("Review logged!");
        setAccumulatedTime(0);
        setIsPaused(false);
        setCardStartTime(Date.now());
        showNextCard();
      } catch (err) {
        console.error("Error updating progress:", err);
        const apiError = handleApiError(err);
        setError(apiError.message || "Failed to save your progress. Please try again.");
        showError(apiError.message || "Failed to save your progress. Please try again.");
      } finally {
        setSubmittingReview(false);
      }
    },
    [currentFlashcardIndex, deckId, flashcards, getElapsedSeconds, logReview, showNextCard, submittingReview]
  );

  return {
    deck,
    flashcards,
    progress,
    currentFlashcardIndex,
    setCurrentFlashcardIndex,
    showAnswer,
    setShowAnswer,
    loading,
    error,
    sessionStats,
    setSessionStats,
    showSummary,
    setShowSummary,
    handleAnswer,
    getCardProgress,
    answeredCards,
    handleFinishSession,
    submittingReview,
    getElapsedSeconds,
    progressLoading,
  };
};
