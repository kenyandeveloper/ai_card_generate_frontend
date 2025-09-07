"use client";

import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  IconButton,
  useTheme,
  Menu,
  Divider,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  MenuIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// NEW: billing dialog
import BillingDialog from "./Billing/BillingDialog";
import { getBillingStatus } from "../utils/billingApi";

const NavBar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingStatus, setBillingStatus] = useState(null);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDarkMode = theme.palette.mode === "dark";

  const logoutButtonColor = "#e53935";
  const logoutButtonHoverColor = "#c62828";
  const profileIconColor = "#16C47F";
  const profileIconTextColor = "#ffffff";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/mydecks", label: "My Decks", icon: BookOpen },
      { path: "/study", label: "Study", icon: GraduationCap },
    ],
    []
  );

  // Fetch billing status when dialog opens or user changes
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

  // Lightweight event bus so other components (AIGenerateModal) can open the dialog:
  useEffect(() => {
    const openHandler = () => setBillingOpen(true);
    window.addEventListener("open-billing", openHandler);
    return () => window.removeEventListener("open-billing", openHandler);
  }, []);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Flashlearn
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                color: isActive ? "primary.main" : "text.secondary",
                "&:hover": { color: "primary.main" },
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          );
        })}

        {/* Mobile: show Upgrade entry if not active */}
        {user && billingStatus?.subscription_status !== "active" && (
          <ListItem
            onClick={() => setBillingOpen(true)}
            sx={{
              color: "primary.main",
              "&:hover": { backgroundColor: "primary.main", color: "#fff" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <BookOpen size={18} />
            </ListItemIcon>
            <ListItemText primary="Upgrade (KES 100)" />
          </ListItem>
        )}

        {user && (
          <ListItem
            onClick={handleLogout}
            sx={{
              color: logoutButtonColor,
              "&:hover": { backgroundColor: `${logoutButtonColor}20` },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogOut size={18} color={logoutButtonColor} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  const isActiveSub = billingStatus?.subscription_status === "active";
  const remaining = billingStatus?.month_remaining ?? null;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.nav",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 0, color: "text.nav" }}
              >
                <MenuIcon size={22} />
              </IconButton>
            )}

            <Typography
              variant={isMobile ? "h6" : "h5"}
              component={RouterLink}
              to="/dashboard"
              sx={{
                fontWeight: "bold",
                color: "text.nav",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: isMobile ? 1 : 0,
              }}
            >
              <BookOpen size={isMobile ? 20 : 24} color="currentColor" />
              Flashlearn
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 2, ml: 6 }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      sx={{
                        color: isActive ? "primary.main" : "text.nav",
                        "&:hover": { color: "primary.main" },
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: isActive ? 600 : 400,
                      }}
                      startIcon={<Icon size={20} />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Upgrade button (desktop) */}
              {user && !isMobile && !isActiveSub && (
                <Button
                  onClick={() => setBillingOpen(true)}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    mr: 1,
                  }}
                >
                  Upgrade (KES 100)
                </Button>
              )}

              {/* Tiny badge: remaining prompts */}
              {user && remaining != null && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mr: 1 }}
                >
                  Free left: <b>{remaining}</b>
                </Typography>
              )}

              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    bgcolor: profileIconColor,
                    color: profileIconTextColor,
                    width: isMobile ? 32 : 36,
                    height: isMobile ? 32 : 36,
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </IconButton>

              {user && !isMobile && (
                <Button
                  onClick={handleLogout}
                  startIcon={<LogOut size={18} />}
                  sx={{
                    color: "#ffffff",
                    bgcolor: logoutButtonColor,
                    "&:hover": { bgcolor: logoutButtonHoverColor },
                    textTransform: "none",
                    fontSize: "0.875rem",
                    px: 1.5,
                    py: 0.75,
                  }}
                >
                  Sign Out
                </Button>
              )}
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  width: isMobile ? 180 : 200,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  "& .MuiMenuItem-root": { py: 1.5 },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  Signed in as
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 500, lineHeight: 1.2 }}
                >
                  {user?.username || "User"}
                </Typography>
              </Box>
              <Divider />
            </Menu>
          </Toolbar>
        </Container>

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              bgcolor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
      </AppBar>

      {/* Billing Dialog */}
      <BillingDialog
        open={billingOpen}
        onClose={() => {
          setBillingOpen(false);
          // refresh header badge after close
          getBillingStatus()
            .then(setBillingStatus)
            .catch(() => {});
        }}
      />
    </>
  );
};

export default NavBar;
