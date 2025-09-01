"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Brain size={40} color="primary.main" />
      </motion.div>
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;