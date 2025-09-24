import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import ProgressStats from "./ProgressStats";
import { useUser } from "../context/UserContext"; // adjust relative path

export default function ProgressStatsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useUser?.() || {};

  // Placeholder XP values; can be replaced by user data later
  const xp = user?.xp ?? 120;
  const nextLevelXp = user?.nextLevelXp ?? 200;
  const progress = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <Box sx={{ mb: isMobile ? 6 : 10 }}>
      <Typography
        variant={isMobile ? "h4" : "h3"}
        component="h2"
        align="center"
        sx={{
          mb: isMobile ? 1.5 : 2,
          fontWeight: "bold",
          color: "text.primary",
          fontSize: isMobile ? "1.75rem" : "2.25rem",
        }}
      >
        Track Your Learning Progress
      </Typography>
      <Typography
        variant={isMobile ? "body1" : "h6"}
        align="center"
        sx={{
          mb: isMobile ? 4 : 6,
          color: "text.secondary",
          maxWidth: "800px",
          mx: "auto",
          fontWeight: "normal",
          fontSize: isMobile ? "1rem" : "1.25rem",
        }}
      >
        Visualize your learning journey with detailed analytics and progress
        tracking to stay motivated.
      </Typography>

      {/* Gamification: XP Progress Bar */}
      <Box
        sx={{
          maxWidth: 500,
          mx: "auto",
          mb: isMobile ? 4 : 6,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ mb: 1, color: "text.secondary", fontWeight: 500 }}
        >
          XP Progress — {xp} / {nextLevelXp}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{ mt: 1, display: "block", color: "text.secondary" }}
        >
          Level {Math.floor(xp / 200) + 1} in progress…
        </Typography>
      </Box>

      <ProgressStats />
    </Box>
  );
}
