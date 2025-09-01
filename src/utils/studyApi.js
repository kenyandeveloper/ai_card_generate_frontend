const API_URL = "https://ai-card-generate-backend.onrender.com";

export const fetchUserData = async (user) => {
  const token = localStorage.getItem("authToken");
  const decksResponse = await fetch(`${API_URL}/decks`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!decksResponse.ok) throw new Error("Failed to fetch decks");
  const decksData = await decksResponse.json();
  const decks = Array.isArray(decksData) ? decksData : [];
  const progressResponse = await fetch(`${API_URL}/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!progressResponse.ok) throw new Error("Failed to fetch progress");
  const progressData = await progressResponse.json();
  const progress = Array.isArray(progressData) ? progressData : [];
  const dashboardResponse = await fetch(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let weeklyGoal = 10;
  let stats = {
    mastery_level: 0,
    study_streak: 0,
    focus_score: 0,
    retention_rate: 0,
    cards_mastered: 0,
    minutes_per_day: 0,
    accuracy: 0,
  };

  if (dashboardResponse.ok) {
    const dashboardData = await dashboardResponse.json();
    if (dashboardData.weekly_goal) {
      weeklyGoal = dashboardData.weekly_goal;
    }

    stats = {
      mastery_level: Math.round(dashboardData.mastery_level) || 0,
      study_streak: Math.round(dashboardData.study_streak) || 0,
      focus_score: Math.round(dashboardData.focus_score) || 0,
      retention_rate: Math.round(dashboardData.retention_rate) || 0,
      cards_mastered: Math.round(dashboardData.cards_mastered) || 0,
      minutes_per_day: Math.round(dashboardData.minutes_per_day) || 0,
      accuracy: Math.round(dashboardData.accuracy) || 0,
    };
  }

  return { decks, progress, weeklyGoal, stats };
};

export const updateWeeklyGoal = async (newWeeklyGoal) => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_URL}/user/stats`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ weekly_goal: newWeeklyGoal }),
  });

  if (!response.ok) throw new Error("Failed to update weekly goal");
  const data = await response.json();
  return data.weekly_goal;
};
