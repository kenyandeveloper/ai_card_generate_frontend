import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Menu,
  School,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BillingDialog from "./Billing/BillingDialog";
import { getBillingStatus } from "../utils/billingApi";

const NavBar = () => {
  const { user, logout, hasRole } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingStatus, setBillingStatus] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = useMemo(() => {
    const items = [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/mydecks", label: "My Decks", icon: BookOpen },
      { path: "/study", label: "Study", icon: GraduationCap },
    ];
    if (hasRole?.("teacher", "admin")) {
      items.push({ path: "/teacher", label: "Teacher", icon: School });
    }
    return items;
  }, [hasRole, user?.role]);

  // Fetch billing status when dialog opens
  useEffect(() => {
    let active = true;
    (async () => {
      if (user && billingOpen) {
        try {
          const s = await getBillingStatus();
          if (active) setBillingStatus(s);
        } catch {}
      }
    })();
    return () => {
      active = false;
    };
  }, [user, billingOpen]);

  // Event bus for opening billing dialog
  useEffect(() => {
    const openHandler = () => setBillingOpen(true);
    window.addEventListener("open-billing", openHandler);
    return () => window.removeEventListener("open-billing", openHandler);
  }, []);

  const isActiveSub = billingStatus?.subscription_status === "active";
  const remaining = billingStatus?.month_remaining ?? null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-white font-bold text-xl md:text-2xl no-underline hover:text-blue-400 transition-colors"
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
                        ? "text-blue-400 font-semibold"
                        : "text-slate-300 hover:text-white"
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
                  className="hidden md:block px-4 py-2 border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors text-sm font-medium"
                >
                  Upgrade (KES 100)
                </button>
              )}

              {/* Free Prompts Remaining */}
              {user && remaining != null && (
                <span className="hidden md:block text-sm text-slate-400">
                  Free left: <strong className="text-white">{remaining}</strong>
                </span>
              )}

              {/* Profile Avatar */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-9 h-9 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center hover:bg-emerald-400 transition-colors"
                aria-label="User menu"
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </button>

              {/* Desktop Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            {menuOpen && (
              <div className="absolute top-16 right-4 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-medium text-white mt-1">
                    {user?.username || "User"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
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
                        ? "bg-blue-500/10 text-blue-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-700"
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-400 hover:bg-slate-700 transition-colors"
                >
                  <BookOpen size={18} />
                  <span>Upgrade (KES 100)</span>
                </button>
              )}

              {/* Mobile: Logout */}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
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
          getBillingStatus()
            .then(setBillingStatus)
            .catch(() => {});
        }}
      />
    </>
  );
};

export default NavBar;
