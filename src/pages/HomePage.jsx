// src/pages/Homepage.jsx
import Navbar from "../components/homepageComponents/Navbar";
import HeroSection from "../components/homepageComponents/HeroSection";
import FeaturesSection from "../components/homepageComponents/FeaturesSection";
import ProgressStatsSection from "../components/homepageComponents/ProgressStatsSection";
import PersonalizedLearningSection from "../components/homepageComponents/PersonalizedLearningSection";
import Footer from "../components/homepageComponents/Footer";

export default function Homepage() {
  return (
    <main className="min-h-dvh bg-background text-text-primary transition-colors">
      <Navbar />

      {/* Dark-only app: no theme props */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <FeaturesSection />

        <hr className="my-6 md:my-8 border-border-strong" />

        <ProgressStatsSection />

        <PersonalizedLearningSection />
      </div>

      <Footer />
    </main>
  );
}
