// src/components/homepageComponents/PersonalizedLearningSection.jsx
"use client";

import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Divider,
} from "@mui/material";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import { useUser } from "../context/UserContext"; // adjust path if needed

export default function PersonalizedLearningSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUser?.() || {};

  // Weekly goal placeholders (pull real data if available)
  const weeklyTarget = user?.weeklyGoal?.targetDays ?? 3;
  const weeklyProgress = user?.weeklyGoal?.completedDays ?? 1;
  const weeklyPct = Math.min((weeklyProgress / weeklyTarget) * 100, 100);
  const streakDays = user?.streakDays ?? user?.stats?.streak ?? 2;

  return (
    <Box sx={{ mb: isMobile ? 6 : 10 }}>
      <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
        {/* Text Section */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h2"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "text.primary",
                fontSize: isMobile ? "1.75rem" : "2.25rem",
              }}
            >
              Your Journey, Your Way
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"}
              sx={{
                mb: 4,
                color: "text.secondary",
                fontSize: isMobile ? "0.875rem" : "1.1rem",
                lineHeight: 1.6,
              }}
            >
              Flashlearn adapts to your unique learning style, creating a
              personalized experience that helps you achieve your goals faster:
            </Typography>

            <Box component="ul" sx={{ pl: 2, mb: 4 }}>
              {[
                "Create custom flashcards tailored to your specific needs",
                "Develop your own learning rhythm with flexible study schedules",
                "Focus on challenging topics with smart repetition algorithms",
                "Track your personal growth with detailed performance insights",
              ].map((item, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{
                    mb: 2,
                    color: "text.primary",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              component={RouterLink}
              to="/signup"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                px: isMobile ? 3 : 4,
                py: isMobile ? 1 : 1.5,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Start your learning journey
            </Button>
          </motion.div>
        </Grid>

        {/* Side Card: Weekly Goal (gamification) */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: isMobile ? 3 : 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WhatshotRoundedIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Weekly Goal
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1 }}
              >
                Study at least{" "}
                <strong>
                  {weeklyTarget} day{weeklyTarget > 1 ? "s" : ""}
                </strong>{" "}
                this week to keep your streak alive.
              </Typography>

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={weeklyPct}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                  aria-label={`Weekly goal progress: ${weeklyProgress} of ${weeklyTarget} days`}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {weeklyProgress}/{weeklyTarget} days
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Streak: Day {streakDays} 🔥
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <ChipLike label="+10 XP / session" />
                <ChipLike label="Keep streak alive" />
                <ChipLike label="Badge: Focus (soon)" />
              </Box>

              {/* Visual (kept from your original) */}
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1729710877311-0e8e70bf820b?w=1200&auto=format&fit=crop&q=60"
                alt="Hand writing on blank notes"
                sx={{
                  width: "100%",
                  height: isMobile ? 220 : 260,
                  objectFit: "cover",
                  borderRadius: 2,
                  mt: 3,
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// tiny internal helper for pill-like info (styled with theme)
function ChipLike({ label }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: "0.75rem",
        px: 1.25,
        py: 0.5,
        borderRadius: 2,
        bgcolor: "action.selected",
        color: "text.secondary",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      {label}
    </Box>
  );
}
