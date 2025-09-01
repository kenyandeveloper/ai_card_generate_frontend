import { createTheme } from "@mui/material/styles";

// Updated light theme colors with a more moderate navbar background
const lightPalette = {
  mode: "light",
  primary: {
    main: "#4255ff", // Blue as requested
    light: "#6b7bff", // Lighter blue
    dark: "#303cb5", // Darker blue
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#3a86ff", // Secondary blue
    light: "#61a0ff", // Light secondary blue
    dark: "#2563eb", // Dark secondary blue
    contrastText: "#ffffff",
  },
  background: {
    default: "#f5f7fa", // Light grey background
    paper: "#ffffff", // White
    nav: "#e2e8f0", // Lighter grey navbar background
  },
  text: {
    primary: "#1a202c", // Very dark grey for primary text
    secondary: "#718096", // Medium grey for secondary text
    nav: "#2d3748", // Dark grey for navbar text for contrast
  },
  accent: {
    light: "#e6e9f0", // Light blue-grey
    medium: "#cbd5e0", // Medium blue-grey
    highlight: "#4255ff", // Blue highlight
  },
  error: {
    main: "#e53935", // Red for error states and logout button
    light: "#ef5350",
    dark: "#c62828",
  },
  warning: {
    main: "#ff9800", // Orange for profile icon
    light: "#ffb74d",
    dark: "#f57c00",
  },
  sun: {
    main: "#ffc107", // Yellow
  },
  moon: {
    main: "#3f51b5", // Blue
  },
};

// Dark theme colors remain the same
const darkPalette = {
  mode: "dark",
  primary: {
    main: "#4255ff",
    light: "#6b7bff",
    dark: "#303cb5",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#3a86ff",
    light: "#61a0ff",
    dark: "#2563eb",
    contrastText: "#ffffff",
  },
  background: {
    default: "#121620",
    paper: "#1e2433",
    nav: "#1a1f2e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#cbd5e0",
    nav: "#ffffff", // White text for navbar in dark mode
  },
  accent: {
    light: "#2d3748",
    medium: "#4a5568",
    highlight: "#4255ff",
  },
  error: {
    main: "#e53935",
    light: "#ef5350",
    dark: "#c62828",
  },
  warning: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
  },
  sun: {
    main: "#ffc107",
  },
  moon: {
    main: "#3f51b5",
  },
};

// Common settings remain the same
const commonSettings = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundImage: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "16px",
          fontWeight: 600,
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: ({ theme }) =>
              theme.palette.mode === "dark" ? "#303cb5" : "#6b7bff",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: ({ theme }) =>
              theme.palette.mode === "dark"
                ? "rgba(66, 85, 255, 0.1)"
                : "rgba(66, 85, 255, 0.1)",
          },
        },
      },
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
};

export const theme = createTheme({
  ...commonSettings,
  palette: lightPalette,
});

export const darkTheme = createTheme({
  ...commonSettings,
  palette: darkPalette,
});
