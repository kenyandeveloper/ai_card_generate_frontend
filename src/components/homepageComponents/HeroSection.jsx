import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-20 bg-background border-b border-border-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary mb-4 leading-tight">
              Master Any Subject with Smart Flashcards
            </h2>

            <p className="text-base md:text-lg text-text-muted mb-6 font-normal">
              Create personalized decks, track your progress, and optimize your
              learning with spaced repetition.
            </p>

            {/* Gamification Hint */}
            <p className="text-sm text-text-muted mb-6">
              Earn XP for every study session. Hit your weekly goal to keep your
              streak alive 🔥
            </p>

            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-emphasis text-primary-foreground px-6 md:px-8 py-2 md:py-3 rounded-lg transition-colors font-semibold group"
            >
              Start learning for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-72 md:h-96 lg:h-[28rem] w-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1625750331870-624de6fd3452?w=1200&auto=format&fit=crop&q=60"
                alt="Chess king representing mastery"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
