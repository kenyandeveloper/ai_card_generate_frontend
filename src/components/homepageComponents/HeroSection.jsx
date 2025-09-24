// src/components/homepageComponents/HeroSection.jsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function HeroSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        py: isMobile ? 6 : 10,
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
          {/* Text */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.2,
                  fontSize: isMobile ? "2rem" : "3rem",
                }}
              >
                Master Any Subject with Smart Flashcards
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  mb: 3,
                  color: "text.secondary",
                  fontWeight: 400,
                  fontSize: isMobile ? "1rem" : "1.125rem",
                }}
              >
                Create personalized decks, track your progress, and optimize
                your learning with spaced repetition.
              </Typography>

              {/* micro-gamification hint */}
              <Typography
                variant="body2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Earn XP for every study session. Hit your weekly goal to keep
                your streak alive 🔥
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
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
                  endIcon={<ArrowRight />}
                >
                  Start learning for free
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Image */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: isMobile ? "300px" : "400px",
                  width: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1625750331870-624de6fd3452?w=1200&auto=format&fit=crop&q=60"
                  alt="Chess king representing mastery"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
