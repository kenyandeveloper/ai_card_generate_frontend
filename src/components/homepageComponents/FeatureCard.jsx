"use client";

import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
  useMediaQuery,
} from "@mui/material";

export default function FeatureCard({ Icon, title, description }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  // Custom icon background colors based on theme
  const iconBgColor = isDarkMode
    ? "rgba(124, 58, 237, 0.15)" // Subtle purple in dark mode
    : "rgba(124, 58, 237, 0.08)"; // Very light purple in light mode

  const iconColor = theme.palette.primary.main;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          bgcolor: "background.paper",
          height: "100%",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          "&:hover": {
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
            borderColor: isDarkMode ? "primary.main" : "primary.light",
          },
        }}
      >
        <CardContent
          sx={{
            p: isMobile ? 3 : 4, // Reduce padding on mobile
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isMobile ? 1.5 : 2, // Reduce gap on mobile
          }}
        >
          <Box
            sx={{
              backgroundColor: iconBgColor,
              padding: "12px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              mb: isMobile ? 1.5 : 2, // Reduce margin on mobile
              boxShadow: isDarkMode
                ? "none"
                : "0 4px 8px rgba(124, 58, 237, 0.1)",
            }}
          >
            <Icon
              style={{
                color: iconColor,
                strokeWidth: 2.5,
              }}
            />
          </Box>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"} // Smaller heading on mobile
            sx={{
              color: "text.primary",
              fontWeight: 600,
              textAlign: "center",
              mb: isMobile ? 0.5 : 1, // Reduce margin on mobile
              fontSize: isMobile ? "1.1rem" : "1.25rem", // Responsive font size
            }}
          >
            {title}
          </Typography>
          <Typography
            variant={isMobile ? "body2" : "body1"} // Smaller text on mobile
            sx={{
              color: "text.secondary",
              textAlign: "center",
              lineHeight: 1.6,
              fontSize: isMobile ? "0.875rem" : "1rem", // Responsive font size
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
