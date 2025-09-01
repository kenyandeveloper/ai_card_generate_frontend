import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import ProgressStats from "./ProgressStats";

export default function ProgressStatsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: isMobile ? 6 : 10 }}>
      <Typography
        variant={isMobile ? "h4" : "h3"} // Smaller heading on mobile
        component="h2"
        align="center"
        sx={{
          mb: isMobile ? 1.5 : 2, // Reduce margin on mobile
          fontWeight: "bold",
          color: "text.primary",
          fontSize: isMobile ? "1.75rem" : "2.25rem", // Responsive font size
        }}
      >
        Track Your Learning Progress
      </Typography>
      <Typography
        variant={isMobile ? "body1" : "h6"} // Smaller subheading on mobile
        align="center"
        sx={{
          mb: isMobile ? 4 : 6, // Reduce margin on mobile
          color: "text.secondary",
          maxWidth: "800px",
          mx: "auto",
          fontWeight: "normal",
          fontSize: isMobile ? "1rem" : "1.25rem", // Responsive font size
        }}
      >
        Visualize your learning journey with detailed analytics and progress
        tracking to stay motivated.
      </Typography>

      <ProgressStats />
    </Box>
  );
}
