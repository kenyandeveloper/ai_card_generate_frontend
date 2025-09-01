"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { Pencil, Trash2, Repeat } from "lucide-react";

const FlashcardItem = ({
  flashcard,
  onEdit,
  onDelete,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;

  const [previewSide, setPreviewSide] = useState("front");

  const toggleCardSide = () => {
    setPreviewSide(previewSide === "front" ? "back" : "front");
  };

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
        }}
      >
        <CardContent
          sx={{
            p: 0,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: { xs: 1, sm: 2 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  bgcolor: "background.default",
                  px: { xs: 0.75, sm: 1 },
                  py: { xs: 0.25, sm: 0.5 },
                  borderRadius: 1,
                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                }}
              >
                {previewSide === "front" ? "Question" : "Answer"}
              </Typography>
              <Tooltip title="Flip card">
                <IconButton
                  size="small"
                  onClick={toggleCardSide}
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    },
                    padding: { xs: 0.5, sm: 0.75 },
                  }}
                >
                  <Repeat size={isMobile ? 14 : 16} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                minHeight: { xs: "60px", sm: "80px" },
                display: "flex",
                alignItems: "flex-start",
                fontSize: { xs: "0.875rem", sm: "1rem" },
                lineHeight: 1.5,
                wordBreak: "break-word",
                whiteSpace: "pre-line",
              }}
            >
              {previewSide === "front"
                ? flashcard.front_text
                : flashcard.back_text}
            </Typography>
          </Box>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Tooltip title="Edit flashcard">
                <IconButton
                  size="small"
                  onClick={() => onEdit(flashcard)}
                  sx={{
                    mr: 1,
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                    padding: { xs: 0.5, sm: 0.75 },
                  }}
                >
                  <Pencil size={isMobile ? 16 : 18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete flashcard">
                <IconButton
                  size="small"
                  onClick={() => onDelete(flashcard.id)}
                  sx={{
                    color: "error.main",
                    "&:hover": { color: "error.dark" },
                    padding: { xs: 0.5, sm: 0.75 },
                  }}
                >
                  <Trash2 size={isMobile ? 16 : 18} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FlashcardItem;
