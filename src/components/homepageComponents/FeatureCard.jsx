// src/components/homepageComponents/FeatureCard.jsx
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
  Chip,
  Tooltip,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function FeatureCard({
  Icon,
  title,
  description,
  locked = false,
  lockReason,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  const iconBgColor = isDarkMode
    ? "rgba(124, 58, 237, 0.15)"
    : "rgba(124, 58, 237, 0.08)";

  const iconColor = theme.palette.primary.main;

  return (
    <motion.div
      whileHover={{ scale: locked ? 1.0 : 1.02, y: locked ? 0 : -5 }}
      transition={{ duration: 0.2 }}
    >
      <Tooltip
        title={locked ? lockReason || "Unlock this feature by leveling up" : ""}
        disableHoverListener={!locked}
        arrow
      >
        <Box sx={{ position: "relative" }}>
          {locked && (
            <Chip
              icon={<LockOutlinedIcon />}
              label="Locked"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                bgcolor: "action.selected",
                color: "text.primary",
                "& .MuiChip-icon": { color: "text.secondary" },
              }}
            />
          )}

          <Card
            sx={{
              bgcolor: "background.paper",
              height: "100%",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              ...(locked
                ? {
                    opacity: 0.75,
                    filter: "grayscale(0.25)",
                    pointerEvents: "none",
                  }
                : {
                    "&:hover": {
                      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                      borderColor: isDarkMode
                        ? "primary.main"
                        : "primary.light",
                    },
                  }),
            }}
          >
            <CardContent
              sx={{
                p: isMobile ? 3 : 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isMobile ? 1.5 : 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: iconBgColor,
                  p: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  mb: isMobile ? 1.5 : 2,
                  boxShadow: isDarkMode
                    ? "none"
                    : "0 4px 8px rgba(124, 58, 237, 0.1)",
                }}
              >
                <Icon style={{ color: iconColor, strokeWidth: 2.5 }} />
              </Box>

              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  textAlign: "center",
                  mb: isMobile ? 0.5 : 1,
                  fontSize: isMobile ? "1.1rem" : "1.25rem",
                }}
              >
                {title}
              </Typography>

              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  color: "text.secondary",
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                {description}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Tooltip>
    </motion.div>
  );
}

FeatureCard.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  locked: PropTypes.bool,
  lockReason: PropTypes.string,
};
