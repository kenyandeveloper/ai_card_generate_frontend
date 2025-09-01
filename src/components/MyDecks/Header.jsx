"use client";

import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { BookOpen, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Header = ({ onCreateDeck, isMobile: propIsMobile }) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;
  const isVerySmall = useMediaQuery("(max-width:360px)");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: isMobile ? "flex-start" : "center",
              sm: "center",
            },
            flexDirection: { xs: isMobile ? "column" : "row", sm: "row" },
            gap: { xs: isMobile ? 1.5 : 0, sm: 0 },
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              mb: { xs: isMobile ? 0.5 : 0, sm: 0 },
            }}
          >
            <BookOpen size={isMobile ? 24 : 32} />
            My Flashcard Decks
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={isMobile ? 16 : 18} />}
            onClick={onCreateDeck}
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              py: { xs: 0.75, sm: undefined },
              px: { xs: 1.5, sm: 2 },
              alignSelf: { xs: isMobile ? "flex-start" : "auto", sm: "auto" },
              textTransform: "none",
            }}
          >
            {isVerySmall ? "New Deck" : "Create New Deck"}
          </Button>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.875rem", sm: "1rem" },
            lineHeight: 1.5,
          }}
        >
          Manage your flashcard decks and track your learning progress
        </Typography>
      </Box>
    </motion.div>
  );
};

export default Header;
