// src/components/Dashboard/WelcomeSection.jsx
"use client";

import { Box, Typography, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useUser } from "../context/UserContext"; // adjust path if needed

const WelcomeSection = ({ username }) => {
  const theme = useTheme();
  const { user } = useUser?.() || {};
  const name =
    username || user?.username || user?.email?.split("@")[0] || "Learner";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.background.paper} 0%, rgba(99,102,241,0.08) 100%)`,
          border: 1,
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            background: (t) =>
              `radial-gradient(circle, ${t.palette.primary.main}20 0%, transparent 70%)`,
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
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main}, ${
                    t.palette.secondary.main || t.palette.primary.dark
                  })`,
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
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.text.primary}, ${t.palette.primary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {greeting}, {name}!
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp size={20} color={theme.palette.primary.main} />
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
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
