// src/components/Study/Study.jsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import NavBar from "../NavBar";
import StudyContent from "./StudyContent";
import StudySkeleton from "./StudySkeleton";
import useStudyData from "./useStudyData";
import WeeklyGoalDialog from "./WeeklyGoalDialog";
import NotificationSnackbar from "./NotificationSnackbar";

const Study = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const decksPerPage = 6;

  const {
    decks,
    pagination,
    isLoading: dataLoading,
    error,
    handlePageChange,
    refreshData,
  } = useStudyData(decksPerPage);

  const [userStats, setUserStats] = useState({
    weekly_goal: 50,
    mastery_level: 0,
    study_streak: 0,
    retention_rate: 0,
    cards_mastered: 0,
  });

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(50);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Authentication redirect
  useEffect(() => {
    if (!userLoading && !isAuthenticated) navigate("/login");
  }, [userLoading, isAuthenticated, navigate]);

  // Fetch user stats
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserStats = async () => {
      try {
        const response = await fetch(
          "https://ai-card-generate-backend.onrender.com/dashboard",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserStats({
            weekly_goal: data.weekly_goal || 50,
            mastery_level: data.mastery_level || 0,
            study_streak: data.study_streak || 0,
            retention_rate: data.retention_rate || 0,
            cards_mastered: data.cards_mastered || 0,
          });
          setNewWeeklyGoal(data.weekly_goal || 50);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, [isAuthenticated]);

  // Handle data errors
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: "Failed to load decks. Please try again later.",
        severity: "error",
      });
      console.error("Deck loading error:", error);
    }
  }, [error]);

  const updateWeeklyGoal = async () => {
    try {
      const response = await fetch(
        "https://ai-card-generate-backend.onrender.com/user/stats",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ weekly_goal: newWeeklyGoal }),
        }
      );

      if (response.ok) {
        setUserStats((prev) => ({ ...prev, weekly_goal: newWeeklyGoal }));
        setGoalDialogOpen(false);
        setSnackbar({
          open: true,
          message: "Weekly goal updated successfully!",
          severity: "success",
        });
        // Refresh data after updating goal
        refreshData(pagination.currentPage);
      } else {
        throw new Error("Failed to update weekly goal");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Error updating weekly goal",
        severity: "error",
      });
    }
  };

  const handleDeckClick = (deckId) => {
    navigate(`/study/${deckId}`);
  };

  if (userLoading || dataLoading) {
    return <StudySkeleton />;
  }

  return (
    <>
      <NavBar />
      <StudyContent
        userStats={userStats}
        decks={decks}
        pagination={pagination}
        handlePageChange={handlePageChange}
        onUpdateGoalClick={() => setGoalDialogOpen(true)}
        onDeckClick={handleDeckClick}
        onCreateDeckClick={() => navigate("/mydecks")}
      />

      <WeeklyGoalDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        weeklyGoal={newWeeklyGoal}
        onWeeklyGoalChange={setNewWeeklyGoal}
        onSave={updateWeeklyGoal}
      />

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default Study;
