"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Divider,
} from "@mui/material";
import useAIGeneration from "./useAIGeneration";

export default function AIGenerateModal({
  open,
  onClose,
  deckId,
  onInserted, // callback(numberInserted) -> reload list in parent
  theme,
}) {
  const [text, setText] = useState("");
  const [count, setCount] = useState(12);
  const [tab, setTab] = useState("direct"); // 'direct' | 'preview'
  const { loading, error, cards, preview, insertIntoDeck, clear } =
    useAIGeneration();

  useEffect(() => {
    if (!open) {
      setText("");
      setCount(12);
      setTab("direct");
      clear();
    }
  }, [open]);

  const disabled = useMemo(
    () => text.trim().length < 30 || loading,
    [text, loading]
  );

  async function handleGenerateDirect() {
    const { inserted } = await insertIntoDeck(deckId, text.trim(), count);
    if (inserted > 0) {
      onInserted?.(inserted);
      onClose();
    }
  }

  async function handlePreview() {
    await preview(text.trim(), count);
    setTab("preview");
  }

  async function handleConfirmInsert() {
    const { inserted } = await insertIntoDeck(deckId, text.trim(), count);
    if (inserted > 0) {
      onInserted?.(inserted);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Generate flashcards with AI</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Paste study material (≥ 30 characters). Choose how many cards to
            generate.
          </Typography>

          <TextField
            label="Study text"
            multiline
            minRows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, article excerpt, or lecture text..."
          />

          <FormControl sx={{ maxWidth: 200 }}>
            <InputLabel id="count-label">Card count</InputLabel>
            <Select
              labelId="count-label"
              label="Card count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              {[6, 8, 10, 12, 15, 20, 25, 30].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loading && <LinearProgress />}

          {error && <Alert severity="error">{error}</Alert>}

          {tab === "preview" && cards?.length > 0 && (
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                bgcolor: "background.default",
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Preview ({cards.length} cards)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <div className="max-h-80 overflow-auto space-y-2">
                {cards.map((c, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Q{idx + 1}. {c.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.answer}
                    </Typography>
                  </Box>
                ))}
              </div>
              <Alert severity="info" sx={{ mt: 2 }}>
                Edits aren’t persisted in preview yet. Confirm to insert the
                generated cards into this deck.
              </Alert>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>

        {tab === "direct" ? (
          <Stack direction="row" spacing={1}>
            <Button
              onClick={handlePreview}
              variant="outlined"
              disabled={disabled}
            >
              Preview
            </Button>
            <Button
              onClick={handleGenerateDirect}
              variant="contained"
              disabled={disabled}
            >
              Generate & Insert
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setTab("direct")} variant="text">
              Back
            </Button>
            <Button
              onClick={handleConfirmInsert}
              variant="contained"
              disabled={loading}
            >
              Insert {cards?.length || count} Cards
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
