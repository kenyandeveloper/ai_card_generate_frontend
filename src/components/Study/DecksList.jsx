import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Chip,
  Paper,
  Button,
  useTheme,
} from "@mui/material";
import { BookOpen, AlertCircle, PlayCircle } from "lucide-react";

const DecksList = ({ decks, onDeckClick, onCreateDeckClick }) => {
  const theme = useTheme();
  const safeDecks = Array.isArray(decks) ? decks : [];

  if (safeDecks.length === 0) {
    return <EmptyDeckState onCreateDeckClick={onCreateDeckClick} />;
  }

  return (
    <Grid container spacing={3}>
      {safeDecks.map((deck) => {
        return (
          <Grid item xs={12} sm={6} md={4} key={deck.id}>
            <DeckCard deck={deck} onClick={() => onDeckClick(deck.id)} />
          </Grid>
        );
      })}
    </Grid>
  );
};

const DeckCard = ({ deck, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
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
        {/* Header Section */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            {deck.title}
          </Typography>
        </Box>

        {/* Body Section */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {/* Description */}
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {deck.description || "No description available."}
          </Typography>

          {/* Subject Chip */}
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Chip
              label={deck.subject}
              size="small"
              sx={{
                bgcolor: "accent.light",
                color: "text.primary",
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        {/* Footer Section */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayCircle size={18} />}
            onClick={onClick}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              borderRadius: 2,
            }}
          >
            Study Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const EmptyDeckState = ({ onCreateDeckClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <AlertCircle size={48} color={theme.palette.text.secondary} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        No decks found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create your first deck to start studying
      </Typography>
      <Button variant="contained" color="primary" onClick={onCreateDeckClick}>
        Create Deck
      </Button>
    </Paper>
  );
};

export default DecksList;
