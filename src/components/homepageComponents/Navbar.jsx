// src/components/homepageComponents/Navbar.jsx
import { Link } from "react-router-dom";
import { Menu, X, Flame } from "lucide-react";
import { useState, useMemo } from "react";
import { useUser } from "../context/UserContext";

function StreakPill() {
  const { user } = useUser?.() || {};
  const streakDays = useMemo(() => {
    if (user?.streakDays != null) return user.streakDays;
    if (user?.stats?.streak != null) return user.stats.streak;
    return 2;
  }, [user]);

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-950/30 rounded-full border border-orange-800"
      aria-label={`Current learning streak: Day ${streakDays}`}
    >
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="text-sm font-semibold text-gray-100">
        Day {streakDays}
      </span>
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Flashlearn</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <StreakPill />

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-purple-400 border border-purple-400 rounded-lg hover:bg-purple-950/30 transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <StreakPill />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
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
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <div className="px-4 py-4 space-y-3">
            {/* Gamification hint */}
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-orange-950/20 rounded-lg border border-orange-800">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Keep your streak!</span>
            </div>

            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-3 text-center text-sm font-medium text-purple-400 border border-purple-400 rounded-lg hover:bg-purple-950/30 transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-3 text-center text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
