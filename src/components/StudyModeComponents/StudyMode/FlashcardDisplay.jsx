"use client";

import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ThumbsUp, ThumbsDown, Trophy } from "lucide-react";

const FlashcardDisplay = ({
  currentFlashcard,
  showAnswer,
  setShowAnswer,
  cardProgress,
}) => {
  const handleCardClick = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <Box sx={{ perspective: "1000px" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showAnswer ? "-answer" : "-question"}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              cursor: "pointer",
              position: "relative",
              "&:hover": {
                boxShadow: (theme) =>
                  `0 0 0 2px ${theme.palette.primary.main}, 0 4px 20px rgba(0,0,0,0.1)`,
              },
            }}
            onClick={handleCardClick}
          >
            <CardContent sx={{ width: "100%", textAlign: "center" }}>
              <Typography variant="h5" sx={{ mb: 2, color: "text.primary" }}>
                {showAnswer ? "Answer" : "Question"}
              </Typography>
              <Typography
                variant="h4"
                sx={{ mb: 4, color: "text.primary", fontWeight: "medium" }}
              >
                {showAnswer
                  ? currentFlashcard.back_text
                  : currentFlashcard.front_text}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {showAnswer ? "Click to see question" : "Click to see answer"}
              </Typography>

              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  display: "flex",
                  gap: 2,
                  color: "text.secondary",
                }}
              >
                <Tooltip title="Times Studied">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Brain size={16} />
                    <Typography variant="caption">
                      {cardProgress.study_count}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Correct Attempts">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ThumbsUp size={16} />
                    <Typography variant="caption">
                      {cardProgress.correct_attempts}
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Incorrect Attempts">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ThumbsDown size={16} />
                    <Typography variant="caption">
                      {cardProgress.incorrect_attempts}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
              {cardProgress.is_learned && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Trophy size={20} />
                  <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                    Mastered
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default FlashcardDisplay;
