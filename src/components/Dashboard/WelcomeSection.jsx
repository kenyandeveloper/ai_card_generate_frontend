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
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(96,165,250,0.08) 100%)`,
          border: `1px solid rgba(148,163,184,0.25)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            background: `radial-gradient(circle, ${theme.palette.primary.main}20 0%, transparent 70%)`,
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
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
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
