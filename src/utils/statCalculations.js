import { calculateStudyStreak } from "./dashBoardutil";

export const calculateStats = (progressData, weekly_goal) => {
  const safeProgressData = Array.isArray(progressData) ? progressData : [];
  const totalAttempts = progressData.reduce(
    (sum, p) => sum + (p.study_count || 0),
    0
  );
  const totalCorrect = progressData.reduce(
    (sum, p) => sum + (p.correct_attempts || 0),
    0
  );
  const totalStudyTime = progressData.reduce(
    (sum, p) => sum + (p.total_study_time || 0),
    0
  );
  const cardsLearned = safeProgressData.filter((p) => p.is_learned).length;
  const cardsStudiedThisWeek = getCardsStudiedThisWeek(progressData);
  const streak = calculateStudyStreak(safeProgressData);
  const averageStudyTime = calculateAverageStudyTime(
    safeProgressData,
    totalStudyTime
  );

  return {
    total_flashcards_studied: cardsStudiedThisWeek || 0,
    weekly_goal: weekly_goal || 0,
    study_streak: streak || 0,
    mastery_level:
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    cards_mastered: cardsLearned || 0,
    retention_rate:
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    average_study_time: averageStudyTime || 0,
  };
};

const getCardsStudiedThisWeek = (progressData) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const toDate = (val) => {
    if (!val) return null;
    const s = String(val);
    // Trim fractional seconds to 3 digits (milliseconds)
    const normalized = s.replace(/(\.\d{3})\d+$/, "$1");
    return new Date(normalized);
  };
  return progressData.filter((p) => {
    const d = toDate(p.last_studied_at);
    return d && d >= startOfWeek;
  }).length;
};

const calculateAverageStudyTime = (progressData, totalStudyTime) => {
  const uniqueDays = new Set(
    progressData
      .map((p) => p.last_studied_at)
      .filter((date) => date)
      .map((date) => new Date(date).toDateString())
  ).size;
  return uniqueDays > 0 ? Math.round(totalStudyTime / uniqueDays) : 0;
};
