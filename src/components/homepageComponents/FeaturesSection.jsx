// src/components/homepageComponents/FeaturesSection.jsx
import { Box, Typography, Grid, useTheme, useMediaQuery } from "@mui/material";
import {
  GraduationCap,
  Target,
  Clock,
  BookOpen,
  Brain,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    Icon: GraduationCap,
    title: "Build decks effortlessly",
    description:
      "Create custom flashcard decks with our intuitive interface. Import content or start from scratch.",
  },
  {
    Icon: Target,
    title: "Track your Study progress",
    description:
      "Monitor your learning journey with detailed analytics and progress tracking.",
  },
  {
    Icon: Clock,
    title: "Review at the perfect time",
    description:
      "Our spaced repetition system ensures you review cards at optimal intervals.",
  },
  {
    Icon: BookOpen,
    title: "Smart Learning Paths",
    description:
      "Follow structured learning paths designed to maximize your retention and understanding.",
  },
  {
    Icon: Brain,
    title: "Memory Techniques",
    description:
      "Learn and apply proven memory techniques to enhance your study sessions.",
  },
  {
    Icon: Sparkles,
    title: "Personalized Insights",
    description:
      "Get personalized recommendations based on your learning patterns and progress.",
  },
];

// Gamified preview (locked until Level 2)
const lockedFeature = {
  Icon: BadgeCheck,
  title: "Achievements & Badges",
  description:
    "Collect badges as you hit milestones and level up your learning.",
  locked: true,
  lockReason: "Unlock at Level 2 (keep your streak 🔥)",
};

export default function FeaturesSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: isMobile ? 6 : 10 }}>
      <Typography
        variant={isMobile ? "h4" : "h3"}
        component="h2"
        align="center"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "text.primary",
          fontSize: isMobile ? "1.75rem" : "2.25rem",
        }}
      >
        Features Designed for Effective Learning
      </Typography>
      <Typography
        variant={isMobile ? "body1" : "h6"}
        align="center"
        sx={{
          mb: isMobile ? 4 : 6,
          color: "text.secondary",
          maxWidth: "800px",
          mx: "auto",
          fontWeight: "normal",
          fontSize: isMobile ? "1rem" : "1.25rem",
        }}
      >
        Our platform combines proven learning techniques with modern technology
        to help you learn faster and remember longer.
      </Typography>

      <Grid container spacing={isMobile ? 2 : 4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <FeatureCard {...feature} />
          </Grid>
        ))}

        {/* Locked teaser card */}
        <Grid item xs={12} sm={6} md={4}>
          <FeatureCard {...lockedFeature} />
        </Grid>
      </Grid>
    </Box>
  );
}
