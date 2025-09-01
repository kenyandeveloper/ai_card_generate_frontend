"use client";

import {
  Grid,
  Card,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { Brain, PlayCircle, Plus } from "lucide-react";
import FlashcardItem from "./FlashcardItem";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const FlashcardList = ({
  flashcards,
  onEdit,
  onDelete,
  navigate,
  deckId,
  onAddFlashcard,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {flashcards.length === 0 ? (
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            p: { xs: 3, sm: 4, md: 6 },
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <Brain
            size={isMobile ? 36 : 48}
            color={theme.palette.primary.main}
            style={{ marginBottom: isMobile ? 12 : 16 }}
          />
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              color: "text.primary",
              mb: { xs: 1, sm: 2 },
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
            }}
          >
            No Flashcards Yet
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
              px: { xs: 1, sm: 2, md: 4 },
            }}
          >
            Create your first flashcard and start learning!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={isMobile ? 16 : 18} />}
            onClick={onAddFlashcard}
            size={isMobile ? "medium" : "large"}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              py: { xs: 1, sm: undefined },
              px: { xs: 2, sm: 3 },
              textTransform: "none",
            }}
          >
            Create Your First Flashcard
          </Button>
        </Card>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {flashcards.map((flashcard) => (
              <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                <motion.div variants={itemVariants}>
                  <FlashcardItem
                    flashcard={flashcard}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isMobile={isMobile}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: { xs: 4, sm: 5, md: 6 }, textAlign: "center" }}>
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              startIcon={<PlayCircle size={isMobile ? 18 : 20} />}
              onClick={() => navigate(`/study/${deckId}`)}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                px: { xs: 4, sm: 5, md: 6 },
                py: { xs: 1, sm: 1.5 },
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                textTransform: "none",
              }}
            >
              Start Studying
            </Button>
          </Box>
        </>
      )}
    </motion.div>
  );
};

export default FlashcardList;
