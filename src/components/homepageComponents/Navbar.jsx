// src/components/homepageComponents/Navbar.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import { useContext, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";

function StreakPill() {
  // Try to pull a real streak from context; otherwise default.
  const { user } = useUser?.() || {};
  const streakDays = useMemo(() => {
    if (user?.streakDays != null) return user.streakDays;
    if (user?.stats?.streak != null) return user.stats.streak;
    return 2; // safe default until backend hooks in
  }, [user]);

  return (
    <Chip
      icon={<WhatshotRoundedIcon />}
      label={`Day ${streakDays}`}
      size="small"
      sx={{
        bgcolor: "action.selected",
        color: "text.primary",
        "& .MuiChip-icon": { color: "warning.main" },
        fontWeight: 600,
      }}
      aria-label={`Current learning streak: Day ${streakDays}`}
    />
  );
}

export default function Navbar() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.nav", // ensure this exists in theme (see theme notes below)
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "saturate(180%) blur(6px)",
      }}
    >
      <Toolbar>
        {/* Brand */}
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          Flashlearn
        </Typography>

        {/* Grow */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Mobile */}
        {isMobile ? (
          <>
            {/* Streak pill stays visible on mobile */}
            <StreakPill />

            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                {/* tiny hint of gamification */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WhatshotRoundedIcon color="warning" fontSize="small" />
                  <Typography variant="body2">Keep your streak!</Typography>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                component={RouterLink}
                to="/login"
              >
                Sign In
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                component={RouterLink}
                to="/signup"
              >
                Get Started
              </MenuItem>
            </Menu>
          </>
        ) : (
          // Desktop
          <Box
            sx={{ display: "flex", gap: 2, alignItems: "center", ml: "auto" }}
          >
            <StreakPill />
            <Button
              variant="outlined"
              component={RouterLink}
              to="/login"
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "rgba(67, 97, 238, 0.04)",
                },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to="/signup"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Get Started
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
