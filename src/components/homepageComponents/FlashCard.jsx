"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Card, CardContent, Button, Typography, Box } from "@mui/material";

export default function FlashCard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Box sx={{ width: 300, height: 250, perspective: "1000px" }}>
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          cursor: "pointer",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Front of card */}
        <Card
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            bgcolor: "background.paper",
            color: "text.primary",
            transition: (theme) =>
              theme.transitions.create(["background-color", "color"], {
                duration: theme.transitions.duration.standard,
              }),
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "16px",
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
              >
                Question:
              </Typography>
              <Typography
                variant="body1"
                sx={{ minHeight: "100px", color: "text.primary" }}
              >
                {question}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setIsFlipped(true)}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Flip
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "rgba(67, 97, 238, 0.04)",
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            bgcolor: "background.paper",
            color: "text.primary",
            transition: (theme) =>
              theme.transitions.create(["background-color", "color"], {
                duration: theme.transitions.duration.standard,
              }),
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "16px",
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}
              >
                Answer:
              </Typography>
              <Typography
                variant="body1"
                sx={{ minHeight: "100px", color: "text.primary" }}
              >
                {answer}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setIsFlipped(false)}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              >
                Flip
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "rgba(67, 97, 238, 0.04)",
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

FlashCard.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};
