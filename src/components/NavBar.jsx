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
import { useState } from "react";

const NavBar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDarkMode = theme.palette.mode === "dark";

  // Define colors
  const logoutButtonColor = "#e53935"; // Red
  const logoutButtonHoverColor = "#c62828"; // Darker red
  const profileIconColor = "#16C47F"; // Green
  const profileIconTextColor = "#ffffff"; // White text

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/mydecks", label: "My Decks", icon: BookOpen },
    { path: "/study", label: "Study", icon: GraduationCap },
  ];

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
                "&:hover": {
                  color: "primary.main",
                },
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

        {user && (
          <ListItem
            onClick={handleLogout}
            sx={{
              color: logoutButtonColor,
              "&:hover": {
                backgroundColor: `${logoutButtonColor}20`,
              },
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

  return (
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
              sx={{
                mr: 0,
                color: "text.nav",
              }}
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
                      "&:hover": {
                        color: "primary.main",
                      },
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
                  "&:hover": {
                    bgcolor: logoutButtonHoverColor,
                  },
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
                "& .MuiMenuItem-root": {
                  py: 1.5,
                },
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
        ModalProps={{
          keepMounted: true,
        }}
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
  );
};

export default NavBar;
