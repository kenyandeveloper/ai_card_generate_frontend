// src/components/homepageComponents/Navbar.jsx
import { Link } from "react-router-dom";
import { Menu, X, Flame } from "lucide-react";
import { useState, useMemo } from "react";
import { useUser } from "../../hooks/useUser";

function StreakPill() {
  const { user } = useUser?.() || {};
  const streakDays = useMemo(() => {
    if (user?.streakDays != null) return user.streakDays;
    if (user?.stats?.streak != null) return user.stats.streak;
    return 2;
  }, [user]);

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-soft rounded-full border border-warning/50"
      aria-label={`Current learning streak: Day ${streakDays}`}
    >
      <Flame className="w-4 h-4 text-warning" />
      <span className="text-sm font-semibold text-text-primary">
        Day {streakDays}
      </span>
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface-elevated/80 backdrop-blur-md border-b border-border-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-text-primary">Flashlearn</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <StreakPill />

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-surface-highlight transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-text-primary bg-primary-emphasis rounded-lg hover:bg-primary-emphasis transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <StreakPill />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-primary hover:bg-surface-highlight rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-muted bg-surface-elevated">
          <div className="px-4 py-4 space-y-3">
            {/* Gamification hint */}
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-warning bg-warning-soft rounded-lg border border-warning/50">
              <Flame className="w-4 h-4 text-warning" />
              <span>Keep your streak!</span>
            </div>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-3 text-center text-sm font-medium text-primary border border-primary rounded-lg hover:bg-surface-highlight transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-3 text-center text-sm font-medium text-text-primary bg-primary-emphasis rounded-lg hover:bg-primary-emphasis transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
