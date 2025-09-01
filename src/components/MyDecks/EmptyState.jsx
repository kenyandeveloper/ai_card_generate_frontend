"use client";

import {
  Card,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GraduationCap, Plus } from "lucide-react";

const EmptyState = ({ theme, onCreateDeck, isMobile: propIsMobile }) => {
  const localTheme = useTheme();
  const systemIsMobile = useMediaQuery(localTheme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        p: { xs: 3, sm: 4, md: 6 },
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <GraduationCap
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
        Start Your Learning Journey
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
        Create your first flashcard deck and begin mastering new subjects.
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
          py: { xs: 1, sm: undefined },
          px: { xs: 2, sm: 3 },
          textTransform: "none",
        }}
      >
        Create Your First Deck
      </Button>
    </Card>
  );
};

export default EmptyState;
