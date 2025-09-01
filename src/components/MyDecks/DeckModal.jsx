"use client";

import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Modal,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";

const DeckModal = ({
  open,
  onClose,
  editingDeck,
  deckTitle,
  setDeckTitle,
  deckDescription,
  setDeckDescription,
  deckSubject,
  setDeckSubject,
  deckCategory,
  setDeckCategory,
  deckDifficulty,
  setDeckDifficulty,
  onSave,
  isMobile: propIsMobile,
}) => {
  const theme = useTheme();
  const systemIsMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMobile = propIsMobile !== undefined ? propIsMobile : systemIsMobile;
  const isVerySmall = useMediaQuery("(max-width:360px)");

  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    deckTitle: false,
    deckDescription: false,
    deckSubject: false,
    deckCategory: false,
    deckDifficulty: false,
  });

  // Validate the form
  const validateForm = () => {
    const errors = {};
    if (!deckTitle.trim()) errors.deckTitle = "Title is required";
    if (!deckDescription.trim())
      errors.deckDescription = "Description is required";
    if (!deckSubject.trim()) errors.deckSubject = "Subject is required";
    if (!deckCategory.trim()) errors.deckCategory = "Category is required";
    if (!deckDifficulty) errors.deckDifficulty = "Difficulty Level is required";

    return errors;
  };

  // Handle form submission
  const handleSave = () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setError("");
      onSave();
    } else {
      setError("Please fill in all required fields.");
      // Mark all fields as touched to show errors
      setTouched({
        deckTitle: true,
        deckDescription: true,
        deckSubject: true,
        deckCategory: true,
        deckDifficulty: true,
      });
    }
  };

  // Handle field blur (when user leaves a field)
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="deck-modal-title"
      aria-describedby="deck-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: isVerySmall ? "95%" : "90%", sm: 500 },
          maxHeight: { xs: "90vh", sm: "80vh" },
          overflow: "auto",
          bgcolor: "background.paper",
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          id="deck-modal-title"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontWeight: "bold",
            fontSize: { xs: "1.1rem", sm: "1.5rem" },
          }}
        >
          {editingDeck ? "Edit Deck" : "Create New Deck"}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: { xs: 2, sm: 3 } }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <TextField
            label="Deck Title"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            onBlur={handleBlur("deckTitle")}
            fullWidth
            required
            error={touched.deckTitle && !deckTitle.trim()}
            helperText={
              touched.deckTitle && !deckTitle.trim() && "Title is required"
            }
            size={isMobile ? "small" : "medium"}
            InputLabelProps={{
              style: { fontSize: isMobile ? "0.875rem" : undefined },
            }}
            InputProps={{
              style: { fontSize: isMobile ? "0.875rem" : undefined },
            }}
          />

          <TextField
            label="Description"
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            onBlur={handleBlur("deckDescription")}
            fullWidth
            multiline
            rows={isMobile ? 2 : 3}
            required
            error={touched.deckDescription && !deckDescription.trim()}
            helperText={
              touched.deckDescription &&
              !deckDescription.trim() &&
              "Description is required"
            }
            size={isMobile ? "small" : "medium"}
            InputLabelProps={{
              style: { fontSize: isMobile ? "0.875rem" : undefined },
            }}
            InputProps={{
              style: { fontSize: isMobile ? "0.875rem" : undefined },
            }}
          />

          <Grid container spacing={isMobile ? 1.5 : 2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                value={deckSubject}
                onChange={(e) => setDeckSubject(e.target.value)}
                onBlur={handleBlur("deckSubject")}
                fullWidth
                required
                error={touched.deckSubject && !deckSubject.trim()}
                helperText={
                  touched.deckSubject &&
                  !deckSubject.trim() &&
                  "Subject is required"
                }
                size={isMobile ? "small" : "medium"}
                InputLabelProps={{
                  style: { fontSize: isMobile ? "0.875rem" : undefined },
                }}
                InputProps={{
                  style: { fontSize: isMobile ? "0.875rem" : undefined },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                value={deckCategory}
                onChange={(e) => setDeckCategory(e.target.value)}
                onBlur={handleBlur("deckCategory")}
                fullWidth
                required
                error={touched.deckCategory && !deckCategory.trim()}
                helperText={
                  touched.deckCategory &&
                  !deckCategory.trim() &&
                  "Category is required"
                }
                size={isMobile ? "small" : "medium"}
                InputLabelProps={{
                  style: { fontSize: isMobile ? "0.875rem" : undefined },
                }}
                InputProps={{
                  style: { fontSize: isMobile ? "0.875rem" : undefined },
                }}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel style={{ fontSize: isMobile ? "0.875rem" : undefined }}>
              Difficulty Level
            </InputLabel>
            <Select
              value={deckDifficulty}
              onChange={(e) => setDeckDifficulty(Number(e.target.value))}
              onBlur={handleBlur("deckDifficulty")}
              label="Difficulty Level"
              required
              error={touched.deckDifficulty && !deckDifficulty}
              style={{ fontSize: isMobile ? "0.875rem" : undefined }}
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <MenuItem
                  key={level}
                  value={level}
                  style={{ fontSize: isMobile ? "0.875rem" : undefined }}
                >
                  {level} -{" "}
                  {level === 1
                    ? "Beginner"
                    : level === 5
                    ? "Expert"
                    : `Level ${level}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: isVerySmall ? "column" : "row", sm: "row" },
              gap: { xs: 1, sm: 2 },
              mt: { xs: 1, sm: 2 },
            }}
          >
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                flex: 1,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                py: { xs: 1, sm: undefined },
                borderRadius: { xs: 1.5, sm: 2 },
                order: { xs: isVerySmall ? 2 : 1, sm: 1 },
              }}
              size={isMobile ? "small" : "medium"}
            >
              {editingDeck
                ? isMobile
                  ? "Save"
                  : "Save Changes"
                : isMobile
                ? "Create"
                : "Create Deck"}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                flex: 1,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "rgba(124, 58, 237, 0.04)",
                },
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                py: { xs: 1, sm: undefined },
                borderRadius: { xs: 1.5, sm: 2 },
                order: { xs: isVerySmall ? 1 : 2, sm: 2 },
              }}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeckModal;
