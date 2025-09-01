import { Box, Grid, Typography, Button, Paper, useTheme } from "@mui/material";
import { Target, Award, Calendar } from "lucide-react";

const StatsOverview = ({ userStats, onUpdateGoalClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "primary.light",
                color: "primary.contrastText",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={24} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Weekly Goal
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {userStats.weekly_goal} cards
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onUpdateGoalClick}
                  sx={{ ml: 1, textTransform: "none" }}
                >
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor: "secondary.light",
                color: "secondary.contrastText",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={24} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Mastery Level
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {userStats.mastery_level.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "primary.dark"
                    : "primary.light",
                color: "primary.contrastText",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={24} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Study Streak
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {userStats.study_streak} days
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatsOverview;
