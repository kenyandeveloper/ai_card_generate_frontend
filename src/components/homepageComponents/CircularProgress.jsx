"use client";

import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  Box,
  CircularProgress as MUICircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export function CircularProgress({ percentage, label, size = 120 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  // Adjust size for mobile screens
  const adjustedSize = isMobile ? 80 : size;

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: adjustedSize,
          height: adjustedSize,
        }}
      >
        {/* Background circle */}
        <MUICircularProgress
          variant="determinate"
          value={100}
          size={adjustedSize}
          thickness={3.2}
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
          }}
        />
        {/* Progress circle */}
        <MUICircularProgress
          variant="determinate"
          value={percentage}
          size={adjustedSize}
          thickness={3.2}
          sx={{
            position: "absolute",
            left: 0,
            color: theme.palette.primary.main,
            circle: {
              strokeLinecap: "round",
            },
          }}
        />
        {/* Percentage text */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"} // Smaller text on mobile
              component="div"
              sx={{
                color: "text.primary",
                fontWeight: "bold",
                fontSize: isMobile ? "1.5rem" : "2rem", // Responsive font size
              }}
            >
              {percentage}%
            </Typography>
          </motion.div>
        </Box>
      </Box>
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          width: "100%",
          textAlign: "center",
          marginTop: isMobile ? "8px" : "16px",
        }} // Reduce margin on mobile
      >
        <Typography
          variant={isMobile ? "body2" : "body1"} // Smaller text on mobile
          sx={{
            color: "text.secondary",
            fontWeight: "medium",
            fontSize: isMobile ? "0.875rem" : "1rem", // Responsive font size
          }}
        >
          {label}
        </Typography>
      </motion.div>
    </Box>
  );
}

CircularProgress.propTypes = {
  percentage: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  size: PropTypes.number,
};
