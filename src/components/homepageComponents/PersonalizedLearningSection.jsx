"use client";

import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export default function PersonalizedLearningSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: isMobile ? 6 : 10 }}>
      <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
        {/* Text Section */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"} // Smaller heading on mobile
              component="h2"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "text.primary",
                fontSize: isMobile ? "1.75rem" : "2.25rem", // Responsive font size
              }}
            >
              Your Journey, Your Way
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "body1"} // Smaller text on mobile
              sx={{
                mb: 4,
                color: "text.secondary",
                fontSize: isMobile ? "0.875rem" : "1.1rem", // Responsive font size
                lineHeight: 1.6,
              }}
            >
              Flashlearn adapts to your unique learning style, creating a
              personalized experience that helps you achieve your goals faster:
            </Typography>

            <Box component="ul" sx={{ pl: 2, mb: 4 }}>
              {[
                "Create custom flashcards tailored to your specific needs",
                "Develop your own learning rhythm with flexible study schedules",
                "Focus on challenging topics with smart repetition algorithms",
                "Track your personal growth with detailed performance insights",
              ].map((item, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{
                    mb: 2,
                    color: "text.primary",
                    fontSize: isMobile ? "0.875rem" : "1rem", // Responsive font size
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>

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
            >
              Start your learning journey
            </Button>
          </motion.div>
        </Grid>

        {/* Image Section */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1729710877311-0e8e70bf820b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGxlYXJuaW5nJTIwZmxhc2hjYXJkJTIwYWVzdGhldGljfGVufDB8fDB8fHww"
                alt="Hand writing on blank notes"
                sx={{
                  width: "100%",
                  height: isMobile ? "300px" : "400px", // Reduce height on mobile
                  objectFit: "cover",
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
