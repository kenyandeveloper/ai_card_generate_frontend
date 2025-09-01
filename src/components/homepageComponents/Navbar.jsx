import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ThemeToggle from "../ThemeComponents/ThemeToggle";
import MenuIcon from "@mui/icons-material/Menu"; // Import the menu icon
import { useState } from "react";

export default function Navbar() {
  // Use the useMediaQuery hook to detect mobile screens
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      <Toolbar>
        {/* Flashlearn Logo */}
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          Flashlearn
        </Typography>

        {/* Mobile View */}
        {isMobile ? (
          <>
            {/* Centered ThemeToggle */}
            <Box
              sx={{
                flexGrow: 1, // Takes up remaining space
                display: "flex",
                justifyContent: "center", // Centers the ThemeToggle
              }}
            >
              <ThemeToggle />
            </Box>

            {/* Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              ></MenuItem>
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
          // Desktop View
          <Box
            sx={{ display: "flex", gap: 2, alignItems: "center", ml: "auto" }}
          >
            <ThemeToggle />
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
                "&:hover": {
                  bgcolor: "primary.dark",
                },
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
