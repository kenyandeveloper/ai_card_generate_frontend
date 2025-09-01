"use client";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useTheme } from "@mui/material/styles";

const WelcomeSection = ({ username }) => {
  const theme = useTheme();
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.accent.light} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.accent.light} 100%)`,
          border: (theme) => `1px solid ${theme.palette.accent.medium}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements using theme colors */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
        />

        <CardContent
          sx={{ p: { xs: 3, sm: 4 }, position: "relative", zIndex: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
              <Sparkles size={24} color="white" />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.accent.highlight})`
                    : `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {getGreeting()}, {username}!
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp size={20} color={theme.palette.primary.main} />
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: { xs: "1rem", sm: "1.125rem" },
              }}
            >
              Track your progress, review your decks, and continue your learning
              journey.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeSection;
