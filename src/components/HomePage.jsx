import { Box, Container, Divider, useTheme } from "@mui/material";
import Navbar from "./homepageComponents/Navbar";
import HeroSection from "./homepageComponents/HeroSection";
import FeaturesSection from "./homepageComponents/FeaturesSection";
import ProgressStatsSection from "./homepageComponents/ProgressStatsSection";
import PersonalizedLearningSection from "./homepageComponents/PersonalizedLearningSection";
import Footer from "./homepageComponents/Footer";

export default function Homepage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <HeroSection isDarkMode={isDarkMode} />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Features Section */}
        <FeaturesSection />

        <Divider sx={{ my: 8 }} />

        {/* Progress Stats Section */}
        <ProgressStatsSection />

        {/* Personalized Learning Section */}
        <PersonalizedLearningSection />
      </Container>

      <Footer isDarkMode={isDarkMode} />
    </Box>
  );
}
