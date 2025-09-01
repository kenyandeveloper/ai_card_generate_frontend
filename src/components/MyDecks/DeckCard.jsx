"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Pencil, Trash2, PlayCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";

const DeckCard = ({
  deck,
  theme,
  onEdit,
  onDelete,
  onStudy,
  navigate,
  isMobile: propIsMobile,
}) => {
  const localTheme = useTheme();
  const systemIsMobile = useMediaQuery(localTheme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;

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
          sx={{ p: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: "0.9rem", sm: "1.25rem" },
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {deck.title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.5, sm: 1 },
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  bgcolor: "background.default",
                  px: { xs: 0.5, sm: 1 },
                  py: { xs: 0.25, sm: 0.5 },
                  borderRadius: 1,
                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                }}
              >
                {deck.subject || "No Subject"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  bgcolor: "background.default",
                  px: { xs: 0.5, sm: 1 },
                  py: { xs: 0.25, sm: 0.5 },
                  borderRadius: 1,
                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                }}
              >
                Diff: {deck.difficulty}/5
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              flexGrow: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                height: { xs: "2.25rem", sm: "auto" },
              }}
            >
              {deck.description || "No description available."}
            </Typography>
            {deck.mastery !== undefined && (
              <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.625rem", sm: "0.75rem" },
                    }}
                  >
                    Mastery
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      fontSize: { xs: "0.625rem", sm: "0.75rem" },
                    }}
                  >
                    {deck.mastery}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={deck.mastery}
                  sx={{
                    height: { xs: 4, sm: 6 },
                    borderRadius: 3,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "primary.main",
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: { xs: isMobile ? "column" : "row", sm: "row" },
              justifyContent: "space-between",
              alignItems: {
                xs: isMobile ? "flex-start" : "center",
                sm: "center",
              },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Box>
              <IconButton
                size="small"
                onClick={(e) => onEdit(e, deck)}
                sx={{
                  mr: 1,
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                  padding: { xs: isMobile ? 0.5 : 0.75, sm: 0.75 },
                }}
              >
                <Pencil size={isMobile ? 16 : 18} />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => onDelete(e, deck.id)}
                sx={{
                  color: "error.main",
                  "&:hover": { color: "error.dark" },
                  padding: { xs: isMobile ? 0.5 : 0.75, sm: 0.75 },
                }}
              >
                <Trash2 size={isMobile ? 16 : 18} />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 2 },
                width: { xs: isMobile ? "100%" : "auto", sm: "auto" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Eye size={isMobile ? 14 : 18} />}
                onClick={() => navigate(`/mydecks/${deck.id}`)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "rgba(124, 58, 237, 0.04)",
                  },
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: undefined },
                  px: { xs: 1, sm: undefined },
                  flex: isMobile ? 1 : "none",
                  minWidth: 0,
                }}
              >
                {isMobile ? "View" : "View"}
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayCircle size={isMobile ? 14 : 18} />}
                onClick={(e) => onStudy(e, deck.id)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  py: { xs: 0.5, sm: undefined },
                  px: { xs: 1, sm: undefined },
                  flex: isMobile ? 1 : "none",
                  minWidth: 0,
                  textTransform: "none",
                }}
              >
                {isMobile ? "Study" : "Study Now"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeckCard;
