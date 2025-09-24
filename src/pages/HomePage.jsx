// src/pages/Homepage.jsx  (recommended new location)
// (If you’re not ready to move it yet, keep the current path and just replace the contents.)

import { Box, Container, Divider } from "@mui/material";
import Navbar from "../components/homepageComponents/Navbar";
import HeroSection from "../components/homepageComponents/HeroSection";
import FeaturesSection from "../components/homepageComponents/FeaturesSection";
import ProgressStatsSection from "../components/homepageComponents/ProgressStatsSection";
import PersonalizedLearningSection from "../components/homepageComponents/PersonalizedLearningSection";
import Footer from "../components/homepageComponents/Footer";

export default function Homepage() {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        minHeight: "100dvh",
        transition: "background-color 0.3s ease",
      }}
    >
      <Navbar />

      {/* Keep prop for now; we’ll remove it in a later pass */}
      <HeroSection isDarkMode />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <FeaturesSection />

        <Divider sx={{ my: { xs: 6, md: 8 } }} />

        <ProgressStatsSection />

        <PersonalizedLearningSection />
      </Container>

      <Footer isDarkMode />
    </Box>
  );
}
