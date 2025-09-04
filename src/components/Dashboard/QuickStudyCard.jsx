"use client";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Clock, Zap, Play } from "lucide-react";

const QuickStudyCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card
        sx={{
          background: "linear-gradient(135deg, #1e293b, #334155)", // dark gradient
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            background: "rgba(255,255,255,0.08)",
            borderRadius: "50%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />

        <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} color="white" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
              Quick Study
            </Typography>
          </Box>

          {/* Content */}
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Ready for a quick study session? Choose a deck to review and improve
            your mastery.
          </Typography>

          {/* Features */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Zap size={16} color="rgba(255,255,255,0.8)" />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                Smart card selection
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Clock size={16} color="rgba(255,255,255,0.8)" />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                5–15 minute sessions
              </Typography>
            </Box>
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<Play size={20} />}
            sx={{
              bgcolor: "#0ea5e9", // bright accent (sky-500)
              color: "white",
              fontWeight: 600,
              py: 1.5,
              "&:hover": {
                bgcolor: "#38bdf8",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Start Studying
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickStudyCard;
