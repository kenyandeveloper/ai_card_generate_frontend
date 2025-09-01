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

export default function HeroSection({ isDarkMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        py: isMobile ? 6 : 10, // Reduce padding on mobile
        bgcolor: isDarkMode ? "background.default" : "background.nav",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
          {/* Text Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant={isMobile ? "h3" : "h2"} // Smaller heading on mobile
                component="h2"
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.2,
                  fontSize: isMobile ? "2rem" : "3rem", // Responsive font size
                }}
              >
                Master Any Subject with Smart Flashcards
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"} // Smaller subheading on mobile
                sx={{
                  mb: 4,
                  color: "text.secondary",
                  fontWeight: "normal",
                  fontSize: isMobile ? "1rem" : "1.25rem", // Responsive font size
                }}
              >
                Create personalized decks, track your progress, and optimize
                your learning with spaced repetition.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "large"} // Smaller button on mobile
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    px: isMobile ? 3 : 4, // Adjust padding on mobile
                    py: isMobile ? 1 : 1.5, // Adjust padding on mobile
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                  endIcon={<ArrowRight />}
                >
                  Start learning for free
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: isMobile ? "300px" : "400px", // Reduce height on mobile
                  width: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1625750331870-624de6fd3452?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1hc3Rlcnl8ZW58MHx8MHx8fDA%3D"
                  alt="Chess king representing mastery"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
