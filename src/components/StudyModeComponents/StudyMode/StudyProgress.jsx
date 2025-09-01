import { Box, Typography, LinearProgress } from "@mui/material";

const StudyProgress = ({ currentIndex, totalCards, progressPercentage }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} of {totalCards} cards
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "background.paper",
          "& .MuiLinearProgress-bar": {
            bgcolor: "primary.main",
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

export default StudyProgress;