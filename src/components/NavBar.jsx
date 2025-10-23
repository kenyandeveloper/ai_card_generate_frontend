import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Menu,
  School,
  X,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BillingDialog from "./Billing/BillingDialog";
import { useBilling } from "../contexts/BillingContext.jsx";

const NavBar = () => {
  const { user, logout, hasRole } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const { billingStatus, isActive: hasActiveSubscription, refresh: refreshBilling } =
    useBilling();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = useMemo(() => {
    const items = [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/progress", label: "Progress", icon: TrendingUp },
      { path: "/mydecks", label: "My Decks", icon: BookOpen },
      { path: "/study", label: "Study", icon: GraduationCap },
    ];
    if (hasRole?.("teacher", "admin")) {
      items.push({ path: "/teacher", label: "Teacher", icon: School });
    }
    return items;
  }, [hasRole]);

  // Refresh billing status when dialog opens
  useEffect(() => {
    if (user && billingOpen) {
      refreshBilling().catch(() => {
        // ignore refresh errors — dialog handles retries
      });
    }
  }, [user, billingOpen, refreshBilling]);

  // Event bus for opening billing dialog
  useEffect(() => {
    const openHandler = () => setBillingOpen(true);
    window.addEventListener("open-billing", openHandler);
    return () => window.removeEventListener("open-billing", openHandler);
  }, []);

  const isActiveSub = hasActiveSubscription;
  const aiUsage = billingStatus?.usage?.ai_generation || {};
  const remaining =
    aiUsage.remaining ??
    billingStatus?.month_remaining ??
    billingStatus?.day_remaining ??
    null;
  const remainingPeriod = aiUsage.month_key
    ? "this month"
    : billingStatus?.month_remaining != null
    ? "this month"
    : billingStatus?.day_remaining != null
    ? "today"
    : null;
  const upgradeLabel = "Upgrade";
  const planIndicatorSource =
    billingStatus?.plan ||
    billingStatus?.plan_type ||
    billingStatus?.subscription_plan ||
    billingStatus?.usage?.plan ||
    "";
  const planIndicatorKey = planIndicatorSource
    .toString()
    .trim()
    .toLowerCase();
  const isDailyPlan = ["daily", "day", "daily_pass"].some((token) =>
    planIndicatorKey.includes(token)
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface-elevated border-b border-border-muted backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-text-primary font-bold text-xl md:text-2xl no-underline hover:text-primary transition-colors"
            >
              <BookOpen size={24} />
              <span>Flashlearn</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 flex-1 ml-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors no-underline ${
                      isActive
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-highlight"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Upgrade Button (Desktop) */}
              {user && !isActiveSub && (
                <button
                  onClick={() => setBillingOpen(true)}
                  className="hidden md:block px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-soft transition-colors text-sm font-medium"
                >
                  {upgradeLabel}
                </button>
              )}

              {/* Free Prompts Remaining */}
              {user && isActiveSub && (
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {isDailyPlan ? "⚡ Daily Pass" : "💎 Pro"}
                </span>
              )}

              {user && remaining != null && (
                <span className="hidden md:block text-sm text-text-muted">
                  Free left{remainingPeriod ? ` ${remainingPeriod}` : ""}:{" "}
                  <strong className="text-text-primary">{remaining}</strong>
                </span>
              )}

              {/* Profile Avatar */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-9 h-9 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center hover:bg-accent-emphasis transition-colors"
                aria-label="User menu"
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* Desktop Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-danger text-text-primary rounded-lg hover:bg-danger transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute top-16 right-4 w-52 bg-surface-elevated border border-border-muted rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border-muted">
                  <p className="text-xs text-text-muted">Signed in as</p>
                  <p className="text-sm font-medium text-text-primary mt-1">
                    {user?.username || "User"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-surface border-t border-border-muted">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors no-underline ${
                      isActive
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-text-secondary hover:bg-surface-highlight"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile: Upgrade Option */}
              {user && !isActiveSub && (
                <button
                  onClick={() => {
                    setBillingOpen(true);
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-surface-highlight transition-colors"
                >
                  <BookOpen size={18} />
                  <span>{upgradeLabel}</span>
                </button>
              )}

              {/* Mobile: Logout */}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger-soft transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Billing Dialog */}
      <BillingDialog
        open={billingOpen}
        onClose={() => {
          setBillingOpen(false);
        }}
      />
    </>
  );
};

export default NavBar;
