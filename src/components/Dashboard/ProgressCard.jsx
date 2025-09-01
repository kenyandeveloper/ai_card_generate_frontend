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

const ProgressCard = ({ stats, theme, isDarkMode }) => {
  const progressPercentage = Math.min(
    (stats.total_flashcards_studied / stats.weekly_goal) * 100,
    100
  );

  const statCards = [
    {
      icon: Trophy,
      label: "Cards Mastered",
      value: stats.cards_mastered,
      color: theme.palette.warning.main, // Using theme colors
    },
    {
      icon: TrendingUp,
      label: "Retention Rate",
      value: `${stats.retention_rate}%`,
      color: theme.palette.primary.main,
    },
    {
      icon: Clock,
      label: "Avg. Study Time",
      value: `${stats.average_study_time}min`,
      color: theme.palette.secondary.main,
    },
    {
      icon: Brain,
      label: "Mastery Level",
      value: `${stats.mastery_level}%`,
      color: theme.palette.accent.highlight,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card sx={{ mb: { xs: 3, sm: 4 } }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${theme.palette.accent.light}, ${theme.palette.background.paper})`
                  : `linear-gradient(135deg, ${theme.palette.accent.light}, ${theme.palette.background.default})`,
              border: (theme) => `1px solid ${theme.palette.accent.medium}`,
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
                    {stats.total_flashcards_studied} / {stats.weekly_goal}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ position: "relative" }}>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      background: (theme) =>
                        `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                      background: (theme) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.accent.light
                          : theme.palette.accent.light,
                      border: (theme) =>
                        `1px solid ${theme.palette.accent.medium}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 8px 32px rgba(66, 85, 255, 0.2)"
                            : "0 8px 32px rgba(66, 85, 255, 0.15)",
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
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          mb: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
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
