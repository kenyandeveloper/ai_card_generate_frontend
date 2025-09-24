// src/components/Dashboard/ProgressCard.jsx
"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { Trophy, Target, Clock, Brain, TrendingUp, Zap } from "lucide-react";
import { useTheme } from "@mui/material/styles";

const ProgressCard = ({ stats }) => {
  const theme = useTheme();

  const weeklyGoal = stats?.weekly_goal || 200; // sensible fallback
  const studied = stats?.total_flashcards_studied || 0;
  const progressPercentage = Math.min(
    weeklyGoal ? (studied / weeklyGoal) * 100 : 0,
    100
  );

  const statCards = [
    {
      icon: Trophy,
      label: "Cards Mastered",
      value: stats?.cards_mastered ?? 0,
      color: theme.palette.warning.main,
    },
    {
      icon: TrendingUp,
      label: "Retention Rate",
      value: `${stats?.retention_rate ?? 0}%`,
      color: theme.palette.primary.main,
    },
    {
      icon: Clock,
      label: "Avg. Study Time",
      value: `${stats?.average_study_time ?? 0}min`,
      color: theme.palette.secondary.main || theme.palette.info.main,
    },
    {
      icon: Brain,
      label: "Mastery Level",
      value: `${stats?.mastery_level ?? 0}%`,
      color: theme.palette.info.main,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card
        sx={{
          mb: { xs: 3, sm: 4 },
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.background.paper}, rgba(99,102,241,0.08))`,
          border: 1,
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main}, ${
                    t.palette.secondary.main || t.palette.primary.dark
                  })`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={24} color="white" />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Learning Progress
            </Typography>
          </Box>

          {/* Weekly Goal Progress */}
          <Card
            sx={{
              mb: 4,
              background: (t) =>
                `linear-gradient(135deg, rgba(255,255,255,0.03), ${t.palette.background.paper})`,
              border: 1,
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Weekly Goal Progress
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Zap size={16} color={theme.palette.primary.main} />
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontWeight: 500 }}
                  >
                    {studied} / {weeklyGoal}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${
                      theme.palette.primary.main
                    }, ${
                      theme.palette.secondary.main || theme.palette.primary.dark
                    })`,
                  },
                }}
              />
              <Box sx={{ mt: 1, textAlign: "right" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  {Math.round(progressPercentage)}% Complete
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <Grid container spacing={3}>
            {statCards.map((stat, index) => (
              <Grid item xs={6} sm={6} md={3} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card
                    sx={{
                      textAlign: "center",
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 32px rgba(66, 85, 255, 0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${stat.color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <stat.icon size={24} color={stat.color} />
                        </Box>
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 500 }}
                      >
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressCard;
