import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Modal,
} from "@mui/material";
import { useState, useEffect } from "react";

const EditFlashcardModal = ({
  open,
  onClose,
  flashcard,
  onSave,
  error,
  setError,
}) => {
  
  const [editedFlashcard, setEditedFlashcard] = useState(flashcard);

  useEffect(() => {
    setEditedFlashcard(flashcard);
  }, [flashcard]);

  const handleSave = () => {
    if (
      !editedFlashcard?.front_text.trim() ||
      !editedFlashcard?.back_text.trim()
    ) {
      setError("Both question and answer are required.");
      return;
    }
    onSave(editedFlashcard); 
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-flashcard-title">
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
          id="edit-flashcard-title"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Edit Flashcard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <TextField
          label="Question"
          value={editedFlashcard?.front_text || ""}
          onChange={(e) =>
            setEditedFlashcard({
              ...editedFlashcard,
              front_text: e.target.value,
            })
          }
          fullWidth
          required
          error={!editedFlashcard?.front_text.trim()}
          helperText={
            !editedFlashcard?.front_text.trim() && "Question is required"
          }
          sx={{ mb: 3 }}
        />

        <TextField
          label="Answer"
          value={editedFlashcard?.back_text || ""}
          onChange={(e) =>
            setEditedFlashcard({
              ...editedFlashcard,
              back_text: e.target.value,
            })
          }
          fullWidth
          required
          error={!editedFlashcard?.back_text.trim()}
          helperText={
            !editedFlashcard?.back_text.trim() && "Answer is required"
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
            Save Changes
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

export default EditFlashcardModal;