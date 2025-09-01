"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { useTheme, useMediaQuery } from "@mui/material";
import DashboardLayout from "./Dashboard/DashboardLayout";
import DashboardContent from "./Dashboard/DashboardContent";
import DashboardSkeleton from "./Dashboard/DashboardSkeleton";
import { fetchDecks } from "../utils/deckApi";
import { fetchUserStats, fetchProgress } from "../utils/dashboardApiHandlers";
import { calculateStats } from "../utils/statCalculations";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [decks, setDecks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({
    total_flashcards_studied: 0,
    weekly_goal: 0,
    study_streak: 0,
    mastery_level: 0,
    cards_mastered: 0,
    retention_rate: 0,
    average_study_time: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const [decksData, progressData, userStats] = await Promise.all([
          fetchDecks(token, 1, 10),
          fetchProgress(token),
          fetchUserStats(token),
        ]);
        setDecks(decksData.decks);
        setProgress(progressData);
        setStats(calculateStats(progressData, userStats.weekly_goal));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton isMobile={isMobile} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent
        user={user}
        stats={stats}
        decks={decks}
        progress={progress}
        isLoading={isLoading}
        theme={theme}
        isDarkMode={isDarkMode}
        navigate={navigate}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
