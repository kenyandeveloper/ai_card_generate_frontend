export const calculateStudyStreak = (progressData) => {
  if (!progressData.length) return 0;

  const dates = progressData
    .map((p) => p.last_studied_at)
    .filter((date) => date)
    .map((date) => new Date(date).toDateString())
    .sort()
    .reverse();

  if (dates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) streak++;
    else break;
  }

  return streak;
};

export const getDeckStats = (deckId, progress) => {
  const deckProgress = progress.filter((p) => p.deck_id === deckId);
  const totalAttempts = deckProgress.reduce((sum, p) => sum + p.study_count, 0);
  const correctAttempts = deckProgress.reduce(
    (sum, p) => sum + p.correct_attempts,
    0
  );
  const mastery =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const cardsLearned = deckProgress.filter((p) => p.is_learned).length;
  const lastStudied =
    deckProgress.length > 0
      ? new Date(
          Math.max(...deckProgress.map((p) => new Date(p.last_studied_at)))
        )
      : null;

  return { mastery, cardsLearned, lastStudied };
};

export const getRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};