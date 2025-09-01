"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Stack,
} from "@mui/material";
import { BookOpen, Plus, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AIGenerateModal from "./AIGenerateModal";

const DeckHeader = ({ deck, onAddFlashcard, navigate, onRefresh }) => {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            separator={<ChevronRight size={16} />}
            sx={{ mb: 2, color: "text.secondary" }}
          >
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/mydecks")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
              }}
            >
              <BookOpen size={16} />
              My Decks
            </Link>
            <Typography color="text.primary">
              {deck?.title || `Deck ${deck?.id}`}
            </Typography>
          </Breadcrumbs>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}
              >
                {deck?.title || `Deck ${deck?.id}`}
              </Typography>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {deck?.description || "No description available"}
              </Typography>
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Sparkles size={18} />}
                onClick={() => setAiOpen(true)}
                sx={{
                  borderRadius: 2,
                }}
              >
                Generate with AI
              </Button>

              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={onAddFlashcard}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  borderRadius: 2,
                }}
              >
                Add Flashcard
              </Button>
            </Stack>
          </Box>
        </Box>
      </motion.div>

      {/* AI Generation Modal */}
      <AIGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        deckId={deck?.id}
        onInserted={(n) => {
          // optionally: show a snackbar here if you have one
          onRefresh?.(); // refresh deck flashcards
        }}
      />
    </>
  );
};

export default DeckHeader;
