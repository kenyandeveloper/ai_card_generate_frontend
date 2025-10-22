// src/components/Dashboard/DashboardLayout.jsx
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import NavBar from "../NavBar";
import MetaStrip from "../common/MetaStrip";

function PillLink({ to, label, active }) {
  return (
    <RouterLink
      to={to}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-focus"
          : "bg-surface-highlight text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
      ].join(" ")}
    >
      {label}
    </RouterLink>
  );
}

export default function DashboardLayout({ children }) {
  const { hasRole } = useUser();
  const { pathname } = useLocation();

  const showTeacher = hasRole?.("teacher", "admin");
  const showAdmin = hasRole?.("admin"); // only admins see Admin pill

  // Active helpers
  const isTeacher = pathname.startsWith("/teacher");
  const isTeacherAssign = pathname.startsWith("/teacher/assign");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Background gradient layer */}
      <div className="relative before:absolute before:inset-0 before:bg-gradient-radial before:from-primary-soft before:via-transparent before:to-transparent before:pointer-events-none">
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

          {/* Secondary nav (only when allowed) */}
          {(showTeacher || showAdmin) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {showTeacher && (
                <>
                  <PillLink
                    to="/teacher"
                    label="Teacher"
                    active={isTeacher && !isTeacherAssign}
                  />
                  <PillLink
                    to="/teacher/assign"
                    label="Assign Decks"
                    active={isTeacherAssign}
                  />
                </>
              )}
              {showAdmin && (
                <PillLink to="/admin" label="Admin" active={isAdmin} />
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
