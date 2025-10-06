const API_URL = import.meta.env.VITE_API_URL;

export const fetchUserStats = async (token) => {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        weekly_goal: data.weekly_goal || 0,
        mastery_level: data.mastery_level || 0,
        study_streak: data.study_streak || 0,
        focus_score: data.focus_score || 0,
        retention_rate: data.retention_rate || 0,
        cards_mastered: data.cards_mastered || 0,
        minutes_per_day: data.minutes_per_day || 0,
        accuracy: data.accuracy || 0,
      };
    }
    throw new Error("Failed to fetch dashboard data");
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      weekly_goal: 0,
      mastery_level: 0,
      study_streak: 0,
      focus_score: 0,
      retention_rate: 0,
      cards_mastered: 0,
      minutes_per_day: 0,
      accuracy: 0,
    };
  }
};

export const fetchProgress = async (token) => {
  const response = await fetch(`${API_URL}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch progress");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};
