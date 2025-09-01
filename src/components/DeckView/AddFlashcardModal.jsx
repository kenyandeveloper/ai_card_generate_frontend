import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Modal,
} from "@mui/material";
import { useState } from "react";

const AddFlashcardModal = ({
  open,
  onClose,
  newFlashcard,
  setNewFlashcard,
  onSave,
  error,
  setError,
}) => {
  const [touched, setTouched] = useState({
    front_text: false,
    back_text: false,
  });

  // Validate the form
  const validateForm = () => {
    const errors = {};
    if (!newFlashcard.front_text.trim())
      errors.front_text = "Question is required";
    if (!newFlashcard.back_text.trim()) errors.back_text = "Answer is required";
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
        front_text: true,
        back_text: true,
      });
    }
  };

  // Handle field blur (when user leaves a field)
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-flashcard-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 500 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          id="add-flashcard-title"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Add New Flashcard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <TextField
          label="Question"
          value={newFlashcard.front_text}
          onChange={(e) =>
            setNewFlashcard({ ...newFlashcard, front_text: e.target.value })
          }
          onBlur={handleBlur("front_text")}
          fullWidth
          required
          error={touched.front_text && !newFlashcard.front_text.trim()}
          helperText={
            touched.front_text &&
            !newFlashcard.front_text.trim() &&
            "Question is required"
          }
          sx={{ mb: 3 }}
        />

        <TextField
          label="Answer"
          value={newFlashcard.back_text}
          onChange={(e) =>
            setNewFlashcard({ ...newFlashcard, back_text: e.target.value })
          }
          onBlur={handleBlur("back_text")}
          fullWidth
          required
          error={touched.back_text && !newFlashcard.back_text.trim()}
          helperText={
            touched.back_text &&
            !newFlashcard.back_text.trim() &&
            "Answer is required"
          }
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
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
            }}
          >
            Add Flashcard
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
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddFlashcardModal;
