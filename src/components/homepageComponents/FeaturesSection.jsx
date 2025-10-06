// src/components/homepageComponents/FeaturesSection.jsx
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

const lockedFeature = {
  Icon: BadgeCheck,
  title: "Achievements & Badges",
  description:
    "Collect badges as you hit milestones and level up your learning.",
  locked: true,
  lockReason: "Unlock at Level 2 (keep your streak 🔥)",
};

export default function FeaturesSection() {
  return (
    <section className="mb-16 md:mb-24">
      {/* Heading */}
      <h2 className="mb-4 text-4xl md:text-5xl font-bold text-center text-gray-100">
        Features Designed for Effective Learning
      </h2>

      {/* Subtitle */}
      <p className="mb-8 md:mb-12 mx-auto max-w-3xl text-base md:text-lg text-center text-gray-400 font-normal">
        Our platform combines proven learning techniques with modern technology
        to help you learn faster and remember longer.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}

        {/* Locked teaser card */}
        <FeatureCard {...lockedFeature} />
      </div>
    </section>
  );
}
