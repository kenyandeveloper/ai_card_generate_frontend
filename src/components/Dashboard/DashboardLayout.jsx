// src/components/Dashboard/DashboardLayout.jsx
import NavBar from "../NavBar";
import MetaStrip from "../common/MetaStrip";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950">
      <NavBar />

      {/* Background gradient layer */}
      <div className="relative before:absolute before:inset-0 before:bg-gradient-radial before:from-indigo-500/8 before:via-transparent before:to-transparent before:pointer-events-none">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-3 pb-6 md:pb-10">
          {/* Ephemeral top strip */}
          <MetaStrip
            showStreak
            showXP
            showWeeklyGoal
            showDue
            dueCount={0}
            ephemeral
            ephemeralMs={1200}
          />

          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
