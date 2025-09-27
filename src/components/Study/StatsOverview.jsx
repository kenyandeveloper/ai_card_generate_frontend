// src/components/Study/StatsOverview.jsx
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Target } from "lucide-react";

export default function StatsOverview({
  userStats,
  onUpdateGoalClick,
  completedThisWeek = 0, // optional, pass real value if you have it
}) {
  const weeklyGoal = userStats?.weekly_goal ?? 50;
  const progress = Math.min((completedThisWeek / weeklyGoal) * 100, 100);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (t) => `${t.palette.primary.main}22`,
            color: "primary.main",
            border: 1,
            borderColor: "divider",
          }}
          aria-hidden
        >
          <Target size={24} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            Weekly Goal
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {weeklyGoal} cards
            </Typography>

            <Tooltip title="Change weekly target">
              <Button
                size="small"
                variant="outlined"
                onClick={onUpdateGoalClick}
                sx={{ textTransform: "none" }}
              >
                Update
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Tiny progress indicator (optional, unobtrusive) */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.75,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {completedThisWeek}/{weeklyGoal} this week
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${
                  theme.palette.secondary?.main || theme.palette.primary.dark
                })`,
            },
          }}
          aria-label={`Weekly goal progress: ${completedThisWeek} of ${weeklyGoal} cards`}
        />
      </Box>
    </Paper>
  );
}
